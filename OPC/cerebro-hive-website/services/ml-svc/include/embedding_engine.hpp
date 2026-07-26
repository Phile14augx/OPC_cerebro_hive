#pragma once

#include <Eigen/Dense>
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <shared_mutex>
#include <functional>

namespace cerebro::ml {

enum class EmbeddingModel {
    MINI_LM   = 384,   // all-MiniLM-L6-v2 (lightweight, fast)
    E5_LARGE  = 1024,  // e5-large-v2 (high quality)
    VOYAGE_CODE = 1536 // voyage-code-2 (code/tech content)
};

inline std::size_t embedding_dim(EmbeddingModel m) {
    return static_cast<std::size_t>(m);
}

struct EmbeddingResult {
    std::vector<float> values;
    EmbeddingModel     model;
    std::size_t        token_count{0};
};

// ── EmbeddingEngine ──────────────────────────────────────────────────────────
// Production note: replace hash-based placeholder with ONNX Runtime loading
// a quantised model (e.g. all-MiniLM-L6-v2.onnx) for real semantic vectors.
// The interface is stable — only the impl changes.

class EmbeddingEngine {
public:
    explicit EmbeddingEngine(EmbeddingModel default_model = EmbeddingModel::MINI_LM);

    EmbeddingResult embed(const std::string& text,
                          EmbeddingModel model) const;

    std::vector<EmbeddingResult> batch_embed(
        const std::vector<std::string>& texts,
        EmbeddingModel model) const;

    // Cosine similarity between two embedding vectors
    static float cosine(const std::vector<float>& a, const std::vector<float>& b);

    // Token count estimate (whitespace split, ÷ 0.75 word→token ratio)
    static std::size_t estimate_tokens(const std::string& text);

private:
    EmbeddingModel default_model_;

    // Deterministic hash-based embedding (stable across runs for same input)
    std::vector<float> compute(const std::string& text, std::size_t dims) const;
};

} // namespace cerebro::ml
