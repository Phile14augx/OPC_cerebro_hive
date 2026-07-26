#include "vector_index.hpp"

#include <algorithm>
#include <chrono>
#include <stdexcept>

namespace cerebro::ml {

// ── VectorIndex ───────────────────────────────────────────────────────────────

VectorIndex::VectorIndex(std::size_t dims, DistanceMetric metric)
    : dims_(dims), metric_(metric) {}

void VectorIndex::upsert(VectorId id, Vector vec, Metadata meta) {
    if (static_cast<std::size_t>(vec.size()) != dims_)
        throw std::invalid_argument("Vector dimension mismatch");

    // Normalise for cosine similarity (unit vector dot product == cosine)
    if (metric_ == DistanceMetric::COSINE) {
        float norm = vec.norm();
        if (norm > 1e-8f) vec /= norm;
    }

    std::unique_lock lock(mu_);
    // Update if exists
    for (auto& e : entries_) {
        if (e.id == id) { e.vec = std::move(vec); e.meta = std::move(meta); matrix_dirty_ = true; return; }
    }
    entries_.push_back({ std::move(id), std::move(vec), std::move(meta) });
    matrix_dirty_ = true;
}

bool VectorIndex::remove(const VectorId& id) {
    std::unique_lock lock(mu_);
    auto it = std::find_if(entries_.begin(), entries_.end(),
                           [&](const IndexEntry& e) { return e.id == id; });
    if (it == entries_.end()) return false;
    entries_.erase(it);
    matrix_dirty_ = true;
    return true;
}

std::vector<SearchMatch> VectorIndex::search(
    const Vector& query_raw,
    std::size_t   top_k,
    float         min_score,
    const Metadata& filter
) const {
    auto t0 = std::chrono::steady_clock::now();

    Vector query = query_raw;
    if (metric_ == DistanceMetric::COSINE) {
        float norm = query.norm();
        if (norm > 1e-8f) query /= norm;
    }

    std::shared_lock lock(mu_);

    if (entries_.empty()) return {};

    // Rebuild matrix if dirty (amortised O(n·d) rebuild, O(d) per query after)
    if (matrix_dirty_) {
        std::size_t n = entries_.size();
        matrix_.resize(n, dims_);
        for (std::size_t i = 0; i < n; ++i)
            matrix_.row(i) = entries_[i].vec;
        matrix_dirty_ = false;
    }

    // Batch dot product — Eigen uses SIMD
    Eigen::VectorXf scores = matrix_ * query;

    // For EUCLIDEAN: score = -distance²
    if (metric_ == DistanceMetric::EUCLIDEAN) {
        for (std::size_t i = 0; i < entries_.size(); ++i) {
            float dist = (entries_[i].vec - query).squaredNorm();
            scores(i) = -dist;
        }
    }

    // Collect matches passing the filter
    std::vector<std::pair<float, std::size_t>> candidates;
    candidates.reserve(entries_.size());
    for (std::size_t i = 0; i < entries_.size(); ++i) {
        float s = scores(i);
        if (s < min_score) continue;
        if (!filter.empty() && !matches_filter(entries_[i].meta, filter)) continue;
        candidates.emplace_back(s, i);
    }

    // Partial sort for top-k
    std::size_t k = std::min(top_k, candidates.size());
    std::partial_sort(candidates.begin(), candidates.begin() + k, candidates.end(),
                      [](const auto& a, const auto& b) { return a.first > b.first; });
    candidates.resize(k);

    std::vector<SearchMatch> results;
    results.reserve(k);
    for (auto& [score, idx] : candidates)
        results.push_back({ entries_[idx].id, score, entries_[idx].meta });

    // Track latency
    auto dt = std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - t0).count();
    total_search_ms_.fetch_add(dt, std::memory_order_relaxed);
    search_count_.fetch_add(1,  std::memory_order_relaxed);

    return results;
}

std::size_t VectorIndex::size() const {
    std::shared_lock lock(mu_);
    return entries_.size();
}

double VectorIndex::avg_search_latency_ms() const {
    uint64_t n = search_count_.load();
    return n == 0 ? 0.0 : total_search_ms_.load() / static_cast<double>(n);
}

bool VectorIndex::matches_filter(const Metadata& meta, const Metadata& filter) const {
    for (const auto& [k, v] : filter) {
        auto it = meta.find(k);
        if (it == meta.end() || it->second != v) return false;
    }
    return true;
}

// ── IndexRegistry ─────────────────────────────────────────────────────────────

IndexRegistry& IndexRegistry::instance() {
    static IndexRegistry inst;
    return inst;
}

VectorIndex& IndexRegistry::get_or_create(
    const std::string& ns, std::size_t dims, DistanceMetric metric
) {
    // Fast path
    {
        std::shared_lock lock(mu_);
        auto it = indices_.find(ns);
        if (it != indices_.end()) return *it->second;
    }
    // Slow path
    std::unique_lock lock(mu_);
    auto [it, _] = indices_.emplace(ns, std::make_unique<VectorIndex>(dims, metric));
    return *it->second;
}

bool IndexRegistry::has(const std::string& ns) const {
    std::shared_lock lock(mu_);
    return indices_.count(ns) > 0;
}

} // namespace cerebro::ml
