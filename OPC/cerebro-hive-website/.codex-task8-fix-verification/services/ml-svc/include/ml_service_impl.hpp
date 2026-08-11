#pragma once

#include "ml.grpc.pb.h"
#include "vector_index.hpp"
#include "embedding_engine.hpp"
#include "lead_scorer.hpp"
#include "recommender.hpp"
#include "pgvector_client.hpp"

#include <grpcpp/grpcpp.h>
#include <memory>

namespace cerebro::ml {

class MlServiceImpl final : public cerebro::ml::proto::MlService::Service {
public:
    MlServiceImpl(
        std::shared_ptr<PgVectorClient> pg,
        std::shared_ptr<EmbeddingEngine> emb,
        std::shared_ptr<LeadScorer> scorer,
        std::shared_ptr<Recommender> recommender
    );

    // Vector index operations
    grpc::Status IndexVector(
        grpc::ServerContext* ctx,
        const proto::IndexVectorRequest* req,
        proto::IndexVectorResponse* res) override;

    grpc::Status SearchVectors(
        grpc::ServerContext* ctx,
        const proto::SearchVectorsRequest* req,
        proto::SearchVectorsResponse* res) override;

    // Recommendations
    grpc::Status GetRecommendations(
        grpc::ServerContext* ctx,
        const proto::GetRecommendationsRequest* req,
        proto::GetRecommendationsResponse* res) override;

    grpc::Status TrackInteraction(
        grpc::ServerContext* ctx,
        const proto::TrackInteractionRequest* req,
        proto::TrackInteractionResponse* res) override;

    // ML inference
    grpc::Status ScoreLead(
        grpc::ServerContext* ctx,
        const proto::ScoreLeadRequest* req,
        proto::ScoreLeadResponse* res) override;

    // Embeddings
    grpc::Status GenerateEmbedding(
        grpc::ServerContext* ctx,
        const proto::GenerateEmbeddingRequest* req,
        proto::GenerateEmbeddingResponse* res) override;

    grpc::Status BatchGenerateEmbeddings(
        grpc::ServerContext* ctx,
        const proto::BatchGenerateEmbeddingsRequest* req,
        proto::BatchGenerateEmbeddingsResponse* res) override;

    // Document classification
    grpc::Status ClassifyDocument(
        grpc::ServerContext* ctx,
        const proto::ClassifyDocumentRequest* req,
        proto::ClassifyDocumentResponse* res) override;

private:
    std::shared_ptr<PgVectorClient>  pg_;
    std::shared_ptr<EmbeddingEngine> emb_;
    std::shared_ptr<LeadScorer>      scorer_;
    std::shared_ptr<Recommender>     recommender_;

    // Shared in-memory index (persists pgvector for durability)
    IndexRegistry& registry_ = IndexRegistry::instance();

    static EmbeddingModel proto_model_to_enum(int model);
    static RecommendationType proto_rtype_to_enum(int rtype);
};

} // namespace cerebro::ml
