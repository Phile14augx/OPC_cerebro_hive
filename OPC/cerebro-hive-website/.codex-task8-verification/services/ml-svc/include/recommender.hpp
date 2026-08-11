#pragma once

#include "vector_index.hpp"

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <mutex>

namespace cerebro::ml {

enum class RecommendationType { SIMILAR_PRODUCTS, COMPLEMENTARY_SERVICES,
                                NEXT_BEST_ACTION, PERSONALISED_CONTENT };

struct Interaction {
    std::string user_id;
    std::string item_id;   // product/service slug
    std::string item_type; // "product" | "service" | "solution"
    float       weight;    // view=0.3, download=0.6, trial=0.9, purchase=1.0
};

struct Recommendation {
    std::string item_id;
    std::string item_type;
    float       score;
    std::string reason;    // "viewed_together", "content_similar", …
};

// ── Recommender ──────────────────────────────────────────────────────────────
// Hybrid: collaborative signals (user–item matrix) + content vectors (kNN).
// For cold-start items falls back to content similarity only.

class Recommender {
public:
    Recommender(VectorIndex& item_embeddings, std::size_t embed_dims);

    // Record a user–item interaction (incremental update)
    void track(const Interaction& i);

    // Get top-n recommendations
    std::vector<Recommendation> recommend(
        const std::string& user_id,
        RecommendationType type,
        std::size_t top_n = 10
    ) const;

    // Similar items (content-only, no user needed)
    std::vector<Recommendation> similar_items(
        const std::string& item_id,
        std::size_t top_n = 5
    ) const;

private:
    // Collaborative: user_id → { item_id → cumulative_weight }
    mutable std::mutex cf_mutex_;
    std::unordered_map<std::string,
        std::unordered_map<std::string, float>> user_item_weights_;

    // Also track item co-occurrence: item_a → { item_b → count }
    std::unordered_map<std::string,
        std::unordered_map<std::string, float>> co_occurrence_;

    VectorIndex& item_embeddings_;  // content vectors (not owned)
    std::size_t embed_dims_;

    // Build a pseudo-user vector from their interaction history
    Vector user_profile_vector(const std::string& user_id) const;
};

} // namespace cerebro::ml
