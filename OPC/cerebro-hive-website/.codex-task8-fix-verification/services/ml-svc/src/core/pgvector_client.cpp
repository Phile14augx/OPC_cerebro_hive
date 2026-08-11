#include "pgvector_client.hpp"

#include <spdlog/spdlog.h>
#include <sstream>
#include <stdexcept>

namespace cerebro::ml {

PgVectorClient::PgVectorClient(const std::string& connection_string)
    : conn_str_(connection_string) {}

pqxx::connection& PgVectorClient::get_conn() {
    if (!conn_ || !conn_->is_open()) {
        conn_ = std::make_unique<pqxx::connection>(conn_str_);
        // Load pgvector extension
        pqxx::work tx(*conn_);
        tx.exec("CREATE EXTENSION IF NOT EXISTS vector");
        tx.commit();
    }
    return *conn_;
}

void PgVectorClient::ensure_schema(std::size_t dims) {
    std::lock_guard<std::mutex> lock(conn_mutex_);
    auto& c = get_conn();
    pqxx::work tx(c);

    std::string sql = R"(
        CREATE TABLE IF NOT EXISTS ml_embeddings (
            id             TEXT        NOT NULL,
            namespace      TEXT        NOT NULL,
            content        TEXT        NOT NULL DEFAULT '',
            embedding      vector()" + std::to_string(dims) + R"() NOT NULL,
            metadata       JSONB       NOT NULL DEFAULT '{}',
            created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (id, namespace)
        );
        CREATE INDEX IF NOT EXISTS ml_emb_ns_idx
            ON ml_embeddings USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100)
            WHERE namespace IS NOT NULL;
    )";

    tx.exec(sql);
    tx.commit();
    spdlog::info("[pgvector] Schema ensured for dims={}", dims);
}

void PgVectorClient::upsert(const PgVectorEntry& entry) {
    std::lock_guard<std::mutex> lock(conn_mutex_);
    auto& c = get_conn();
    pqxx::work tx(c);

    tx.exec_params(
        R"(INSERT INTO ml_embeddings (id, namespace, content, embedding, metadata)
           VALUES ($1, $2, $3, $4::vector, $5::jsonb)
           ON CONFLICT (id, namespace) DO UPDATE
               SET content   = EXCLUDED.content,
                   embedding = EXCLUDED.embedding,
                   metadata  = EXCLUDED.metadata)",
        entry.id,
        entry.namespace_,
        entry.content,
        to_pg_literal(entry.embedding),
        entry.metadata_json.empty() ? "{}" : entry.metadata_json
    );
    tx.commit();
}

void PgVectorClient::batch_upsert(const std::vector<PgVectorEntry>& entries) {
    if (entries.empty()) return;
    std::lock_guard<std::mutex> lock(conn_mutex_);
    auto& c = get_conn();
    pqxx::work tx(c);

    for (const auto& e : entries) {
        tx.exec_params(
            R"(INSERT INTO ml_embeddings (id, namespace, content, embedding, metadata)
               VALUES ($1, $2, $3, $4::vector, $5::jsonb)
               ON CONFLICT (id, namespace) DO UPDATE
                   SET content   = EXCLUDED.content,
                       embedding = EXCLUDED.embedding,
                       metadata  = EXCLUDED.metadata)",
            e.id, e.namespace_, e.content,
            to_pg_literal(e.embedding),
            e.metadata_json.empty() ? "{}" : e.metadata_json
        );
    }
    tx.commit();
    spdlog::debug("[pgvector] Batch upserted {} vectors", entries.size());
}

std::vector<PgVectorMatch> PgVectorClient::search_cosine(
    const std::string& ns,
    const std::vector<float>& query,
    std::size_t top_k,
    float max_distance
) {
    std::lock_guard<std::mutex> lock(conn_mutex_);
    auto& c = get_conn();
    pqxx::work tx(c);

    auto rows = tx.exec_params(
        R"(SELECT id, (embedding <=> $1::vector) AS distance, content, metadata::text
           FROM ml_embeddings
           WHERE namespace = $2
             AND (embedding <=> $1::vector) <= $3
           ORDER BY embedding <=> $1::vector
           LIMIT $4)",
        to_pg_literal(query),
        ns,
        static_cast<double>(max_distance),
        static_cast<int64_t>(top_k)
    );

    std::vector<PgVectorMatch> results;
    results.reserve(rows.size());
    for (const auto& row : rows) {
        results.push_back({
            .id            = row[0].as<std::string>(),
            .distance      = static_cast<float>(row[1].as<double>()),
            .content       = row[2].as<std::string>(),
            .metadata_json = row[3].as<std::string>(),
        });
    }
    tx.commit();
    return results;
}

bool PgVectorClient::remove(const std::string& id) {
    std::lock_guard<std::mutex> lock(conn_mutex_);
    auto& c = get_conn();
    pqxx::work tx(c);
    auto r = tx.exec_params(
        "DELETE FROM ml_embeddings WHERE id = $1", id);
    tx.commit();
    return r.affected_rows() > 0;
}

std::string PgVectorClient::to_pg_literal(const std::vector<float>& v) {
    std::ostringstream os;
    os << '[';
    for (std::size_t i = 0; i < v.size(); ++i) {
        if (i) os << ',';
        os << v[i];
    }
    os << ']';
    return os.str();
}

} // namespace cerebro::ml
