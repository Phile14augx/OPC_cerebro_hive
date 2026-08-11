#pragma once

#include <pqxx/pqxx>
#include <string>
#include <vector>
#include <optional>
#include <memory>
#include <mutex>

namespace cerebro::ml {

struct PgVectorEntry {
    std::string              id;
    std::string              namespace_; // index namespace
    std::string              content;    // source text / JSON
    std::vector<float>       embedding;
    std::string              metadata_json;
};

struct PgVectorMatch {
    std::string id;
    float       distance;
    std::string content;
    std::string metadata_json;
};

// ── PgVectorClient ───────────────────────────────────────────────────────────
// Thin wrapper around pgvector extension via libpqxx.
// Assumes table: ml_embeddings(id, namespace, content, embedding vector(N), metadata jsonb)

class PgVectorClient {
public:
    explicit PgVectorClient(const std::string& connection_string);

    // Ensure table and index exist (idempotent)
    void ensure_schema(std::size_t dims);

    // Upsert a single vector
    void upsert(const PgVectorEntry& entry);

    // Batch upsert
    void batch_upsert(const std::vector<PgVectorEntry>& entries);

    // Cosine similarity search (<=> operator)
    std::vector<PgVectorMatch> search_cosine(
        const std::string& ns,
        const std::vector<float>& query,
        std::size_t top_k,
        float max_distance = 1.0f
    );

    // Delete by id
    bool remove(const std::string& id);

private:
    std::string             conn_str_;
    mutable std::mutex      conn_mutex_;
    std::unique_ptr<pqxx::connection> conn_;

    pqxx::connection& get_conn();

    // Format a float vector as pgvector literal: '[0.1,0.2,...]'
    static std::string to_pg_literal(const std::vector<float>& v);
};

} // namespace cerebro::ml
