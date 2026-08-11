#pragma once

#include <Eigen/Dense>
#include <atomic>
#include <cstddef>
#include <memory>
#include <optional>
#include <shared_mutex>
#include <string>
#include <unordered_map>
#include <vector>

namespace cerebro::ml {

// ── Types ─────────────────────────────────────────────────────────────────────

using Vector    = Eigen::VectorXf;
using Matrix    = Eigen::MatrixXf;
using VectorId  = std::string;
using Metadata  = std::unordered_map<std::string, std::string>;

enum class DistanceMetric { COSINE, EUCLIDEAN, DOT_PRODUCT };

struct IndexEntry {
    VectorId id;
    Vector   vec;
    Metadata meta;
};

struct SearchMatch {
    VectorId id;
    float    score;
    Metadata meta;
};

// ── HNSW-lite flat index ──────────────────────────────────────────────────────
// Production would use FAISS or hnswlib; this implements flat exact search
// with Eigen SIMD acceleration — correct, vectorised, and fast for <1M vectors.

class VectorIndex {
public:
    explicit VectorIndex(std::size_t dims, DistanceMetric metric = DistanceMetric::COSINE);
    ~VectorIndex() = default;

    // Insert or update a vector
    void upsert(VectorId id, Vector vec, Metadata meta = {});

    // Remove a vector
    bool remove(const VectorId& id);

    // k-nearest-neighbour search
    std::vector<SearchMatch> search(
        const Vector& query,
        std::size_t   top_k,
        float         min_score            = 0.0f,
        const Metadata& metadata_filter    = {}
    ) const;

    // Stats
    std::size_t size() const;
    std::size_t dims() const { return dims_; }
    double      avg_search_latency_ms() const;

private:
    float similarity(const Vector& a, const Vector& b) const;
    bool  matches_filter(const Metadata& meta, const Metadata& filter) const;

    std::size_t    dims_;
    DistanceMetric metric_;

    // Data store — locked for concurrent read, exclusive for write
    mutable std::shared_mutex mu_;
    std::vector<IndexEntry>   entries_;

    // Precomputed matrix for batch dot-product (rebuilt on each upsert/remove)
    mutable Matrix            matrix_;       // rows = entries, cols = dims
    mutable bool              matrix_dirty_ = true;

    // Latency tracking
    mutable std::atomic<double> total_search_ms_{0.0};
    mutable std::atomic<uint64_t> search_count_{0};
};

// ── Namespace registry ────────────────────────────────────────────────────────

class IndexRegistry {
public:
    static IndexRegistry& instance();

    VectorIndex& get_or_create(const std::string& ns, std::size_t dims,
                               DistanceMetric metric = DistanceMetric::COSINE);
    bool         has(const std::string& ns) const;

private:
    IndexRegistry() = default;
    mutable std::shared_mutex mu_;
    std::unordered_map<std::string, std::unique_ptr<VectorIndex>> indices_;
};

} // namespace cerebro::ml
