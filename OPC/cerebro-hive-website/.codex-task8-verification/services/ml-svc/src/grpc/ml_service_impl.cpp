#include "ml_service_impl.hpp"

#include <spdlog/spdlog.h>
#include <algorithm>
#include <stdexcept>

namespace cerebro::ml {

// ── Constructor ───────────────────────────────────────────────────────────────

MlServiceImpl::MlServiceImpl(
    std::shared_ptr<PgVectorClient>  pg,
    std::shared_ptr<EmbeddingEngine> emb,
    std::shared_ptr<LeadScorer>      scorer,
    std::shared_ptr<Recommender>     recommender
) : pg_(std::move(pg)),
    emb_(std::move(emb)),
    scorer_(std::move(scorer)),
    recommender_(std::move(recommender)) {}

// ── IndexVector ───────────────────────────────────────────────────────────────

grpc::Status MlServiceImpl::IndexVector(
    grpc::ServerContext*,
    const proto::IndexVectorRequest* req,
    proto::IndexVectorResponse* res
) {
    try {
        std::size_t dims = req->embedding_size();
        if (dims == 0)
            return grpc::Status(grpc::INVALID_ARGUMENT, "embedding must not be empty");

        // Build in-memory vector
        Vector vec(dims);
        for (int i = 0; i < req->embedding_size(); ++i)
            vec(i) = req->embedding(i);

        // Metadata from proto map
        Metadata meta(req->metadata().begin(), req->metadata().end());
        meta["namespace"] = req->namespace_();
        meta["id"]        = req->id();

        auto& idx = registry_.get_or_create(req->namespace_(), dims);
        idx.upsert(req->id(), vec, meta);

        // Persist to pgvector
        PgVectorEntry entry;
        entry.id           = req->id();
        entry.namespace_   = req->namespace_();
        entry.content      = req->content();
        entry.embedding    = {req->embedding().begin(), req->embedding().end()};
        entry.metadata_json = "{}";
        pg_->upsert(entry);

        res->set_id(req->id());
        res->set_indexed(true);

        spdlog::debug("IndexVector ns={} id={} dims={}", req->namespace_(), req->id(), dims);
        return grpc::Status::OK;
    } catch (const std::exception& e) {
        spdlog::error("IndexVector error: {}", e.what());
        return grpc::Status(grpc::INTERNAL, e.what());
    }
}

// ── SearchVectors ─────────────────────────────────────────────────────────────

grpc::Status MlServiceImpl::SearchVectors(
    grpc::ServerContext*,
    const proto::SearchVectorsRequest* req,
    proto::SearchVectorsResponse* res
) {
    try {
        std::size_t dims  = req->query_embedding_size();
        std::size_t top_k = req->top_k() > 0 ? req->top_k() : 10;

        Vector query(dims);
        for (int i = 0; i < req->query_embedding_size(); ++i)
            query(i) = req->query_embedding(i);

        Metadata filter(req->metadata_filter().begin(), req->metadata_filter().end());

        // Try in-memory index first
        if (registry_.has(req->namespace_())) {
            auto& idx    = registry_.get_or_create(req->namespace_(), dims);
            auto matches = idx.search(query, top_k, req->min_score(), filter);

            for (const auto& m : matches) {
                auto* hit = res->add_matches();
                hit->set_id(m.id);
                hit->set_score(m.score);
                for (const auto& [k, v] : m.meta)
                    (*hit->mutable_metadata())[k] = v;
            }
            res->set_total_indexed(static_cast<int64_t>(idx.size()));
            res->set_latency_ms(idx.avg_search_latency_ms());
        } else {
            // Fall back to pgvector
            std::vector<float> qv(query.data(), query.data() + dims);
            auto pg_matches = pg_->search_cosine(req->namespace_(), qv, top_k, 1.0f - req->min_score());
            for (const auto& m : pg_matches) {
                auto* hit = res->add_matches();
                hit->set_id(m.id);
                hit->set_score(1.0f - m.distance);
            }
        }
        return grpc::Status::OK;
    } catch (const std::exception& e) {
        spdlog::error("SearchVectors error: {}", e.what());
        return grpc::Status(grpc::INTERNAL, e.what());
    }
}

// ── GetRecommendations ────────────────────────────────────────────────────────

grpc::Status MlServiceImpl::GetRecommendations(
    grpc::ServerContext*,
    const proto::GetRecommendationsRequest* req,
    proto::GetRecommendationsResponse* res
) {
    try {
        auto rtype = proto_rtype_to_enum(req->recommendation_type());
        std::size_t top_n = req->top_n() > 0 ? req->top_n() : 10;

        auto recs = recommender_->recommend(req->user_id(), rtype, top_n);
        for (const auto& r : recs) {
            auto* item = res->add_recommendations();
            item->set_item_id(r.item_id);
            item->set_item_type(r.item_type);
            item->set_score(r.score);
            item->set_reason(r.reason);
        }
        res->set_user_id(req->user_id());
        return grpc::Status::OK;
    } catch (const std::exception& e) {
        spdlog::error("GetRecommendations error: {}", e.what());
        return grpc::Status(grpc::INTERNAL, e.what());
    }
}

// ── TrackInteraction ──────────────────────────────────────────────────────────

grpc::Status MlServiceImpl::TrackInteraction(
    grpc::ServerContext*,
    const proto::TrackInteractionRequest* req,
    proto::TrackInteractionResponse* res
) {
    try {
        Interaction i{
            .user_id   = req->user_id(),
            .item_id   = req->item_id(),
            .item_type = req->item_type(),
            .weight    = req->weight() > 0 ? req->weight() : 0.3f,
        };
        recommender_->track(i);
        res->set_tracked(true);
        return grpc::Status::OK;
    } catch (const std::exception& e) {
        return grpc::Status(grpc::INTERNAL, e.what());
    }
}

// ── ScoreLead ─────────────────────────────────────────────────────────────────

grpc::Status MlServiceImpl::ScoreLead(
    grpc::ServerContext*,
    const proto::ScoreLeadRequest* req,
    proto::ScoreLeadResponse* res
) {
    try {
        LeadFeatures f;
        f.industry        = req->industry();
        f.company_size    = req->company_size();
        f.region          = req->region();
        f.page_views      = req->page_views();
        f.session_count   = req->session_count();
        f.content_downloads = req->content_downloads();
        f.booked_demo     = req->booked_demo();
        f.attended_webinar = req->attended_webinar();
        f.academy_enrolled = req->academy_enrolled();
        f.engagement_type = req->engagement_type();
        f.days_since_first_visit = req->days_since_first_visit();
        f.days_since_last_visit  = req->days_since_last_visit();
        for (const auto& p : req->products_viewed()) f.products_viewed.push_back(p);
        for (const auto& s : req->solutions_viewed()) f.solutions_viewed.push_back(s);

        auto ls = scorer_->score(f);
        res->set_score(ls.score);
        res->set_grade(ls.grade);
        res->set_rationale(ls.rationale);
        for (const auto& [k, v] : ls.feature_contributions)
            (*res->mutable_feature_contributions())[k] = v;

        return grpc::Status::OK;
    } catch (const std::exception& e) {
        spdlog::error("ScoreLead error: {}", e.what());
        return grpc::Status(grpc::INTERNAL, e.what());
    }
}

// ── GenerateEmbedding ─────────────────────────────────────────────────────────

grpc::Status MlServiceImpl::GenerateEmbedding(
    grpc::ServerContext*,
    const proto::GenerateEmbeddingRequest* req,
    proto::GenerateEmbeddingResponse* res
) {
    try {
        auto model  = proto_model_to_enum(req->model());
        auto result = emb_->embed(req->text(), model);

        for (float v : result.values) res->add_embedding(v);
        res->set_model(req->model());
        res->set_token_count(static_cast<int32_t>(result.token_count));
        res->set_dims(static_cast<int32_t>(result.values.size()));
        return grpc::Status::OK;
    } catch (const std::exception& e) {
        return grpc::Status(grpc::INTERNAL, e.what());
    }
}

// ── BatchGenerateEmbeddings ───────────────────────────────────────────────────

grpc::Status MlServiceImpl::BatchGenerateEmbeddings(
    grpc::ServerContext*,
    const proto::BatchGenerateEmbeddingsRequest* req,
    proto::BatchGenerateEmbeddingsResponse* res
) {
    try {
        auto model = proto_model_to_enum(req->model());
        std::vector<std::string> texts(req->texts().begin(), req->texts().end());
        auto results = emb_->batch_embed(texts, model);

        for (const auto& r : results) {
            auto* emb_msg = res->add_embeddings();
            for (float v : r.values) emb_msg->add_values(v);
            emb_msg->set_token_count(static_cast<int32_t>(r.token_count));
        }
        res->set_count(static_cast<int32_t>(results.size()));
        return grpc::Status::OK;
    } catch (const std::exception& e) {
        return grpc::Status(grpc::INTERNAL, e.what());
    }
}

// ── ClassifyDocument ─────────────────────────────────────────────────────────

grpc::Status MlServiceImpl::ClassifyDocument(
    grpc::ServerContext*,
    const proto::ClassifyDocumentRequest* req,
    proto::ClassifyDocumentResponse* res
) {
    try {
        // Zero-shot classification: embed document + each label, pick closest
        auto doc_emb = emb_->embed(req->content(), EmbeddingModel::MINI_LM);

        float best_score = -1.0f;
        std::string best_label;

        for (const auto& label : req->candidate_labels()) {
            auto lbl_emb = emb_->embed(label, EmbeddingModel::MINI_LM);
            float sim    = EmbeddingEngine::cosine(doc_emb.values, lbl_emb.values);
            if (sim > best_score) { best_score = sim; best_label = label; }
        }

        // Confidence scores for all labels
        for (const auto& label : req->candidate_labels()) {
            auto lbl_emb = emb_->embed(label, EmbeddingModel::MINI_LM);
            float sim    = EmbeddingEngine::cosine(doc_emb.values, lbl_emb.values);
            (*res->mutable_scores())[label] = sim;
        }

        res->set_label(best_label);
        res->set_confidence(best_score);
        return grpc::Status::OK;
    } catch (const std::exception& e) {
        return grpc::Status(grpc::INTERNAL, e.what());
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

EmbeddingModel MlServiceImpl::proto_model_to_enum(int model) {
    switch (model) {
        case 1: return EmbeddingModel::E5_LARGE;
        case 2: return EmbeddingModel::VOYAGE_CODE;
        default: return EmbeddingModel::MINI_LM;
    }
}

RecommendationType MlServiceImpl::proto_rtype_to_enum(int rtype) {
    switch (rtype) {
        case 1: return RecommendationType::COMPLEMENTARY_SERVICES;
        case 2: return RecommendationType::NEXT_BEST_ACTION;
        case 3: return RecommendationType::PERSONALISED_CONTENT;
        default: return RecommendationType::SIMILAR_PRODUCTS;
    }
}

} // namespace cerebro::ml
