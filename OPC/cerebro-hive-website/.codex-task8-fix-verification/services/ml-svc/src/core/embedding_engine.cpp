#include "embedding_engine.hpp"

#include <Eigen/Dense>
#include <algorithm>
#include <cmath>
#include <functional>
#include <numeric>
#include <sstream>

namespace cerebro::ml {

EmbeddingEngine::EmbeddingEngine(EmbeddingModel default_model)
    : default_model_(default_model) {}

EmbeddingResult EmbeddingEngine::embed(const std::string& text,
                                       EmbeddingModel model) const {
    std::size_t dims = embedding_dim(model);
    return EmbeddingResult{
        .values      = compute(text, dims),
        .model       = model,
        .token_count = estimate_tokens(text),
    };
}

std::vector<EmbeddingResult> EmbeddingEngine::batch_embed(
    const std::vector<std::string>& texts,
    EmbeddingModel model
) const {
    std::vector<EmbeddingResult> out;
    out.reserve(texts.size());
    for (const auto& t : texts) out.push_back(embed(t, model));
    return out;
}

float EmbeddingEngine::cosine(const std::vector<float>& a,
                               const std::vector<float>& b) {
    if (a.size() != b.size() || a.empty()) return 0.0f;
    Eigen::Map<const Eigen::VectorXf> va(a.data(), a.size());
    Eigen::Map<const Eigen::VectorXf> vb(b.data(), b.size());
    float denom = va.norm() * vb.norm();
    if (denom < 1e-8f) return 0.0f;
    return va.dot(vb) / denom;
}

std::size_t EmbeddingEngine::estimate_tokens(const std::string& text) {
    std::istringstream ss(text);
    std::size_t words = 0;
    std::string w;
    while (ss >> w) ++words;
    return static_cast<std::size_t>(words / 0.75f);
}

// ── Deterministic hash-based placeholder embedding ────────────────────────────
// Produces stable, normalised vectors from text without a model binary.
// Replace with ONNX Runtime inference in production:
//   Ort::Session session(env, model_path, session_opts);
//   ... tokenise → run → extract last_hidden_state → mean_pool → normalise

std::vector<float> EmbeddingEngine::compute(const std::string& text,
                                             std::size_t dims) const {
    // Multiple independent hash seeds for different dimensions
    std::vector<float> v(dims);

    // Split into tokens for token-level features
    std::vector<std::string> tokens;
    {
        std::istringstream ss(text);
        std::string tok;
        while (ss >> tok) { std::transform(tok.begin(), tok.end(), tok.begin(), ::tolower); tokens.push_back(tok); }
    }

    // Bigram-level hash accumulation across dims
    constexpr std::size_t SEEDS = 8;
    static const std::size_t seeds[SEEDS] = {
        0x517cc1b727220a95ULL, 0xbf58476d1ce4e5b9ULL,
        0x94d049bb133111ebULL, 0xc4ceb9fe1a85ec53ULL,
        0x9e3779b97f4a7c15ULL, 0x6c62272e07bb0142ULL,
        0x27d4eb2f165667c5ULL, 0xa24baed4963ee407ULL,
    };

    auto hash_str = [](const std::string& s, std::size_t seed) -> std::size_t {
        std::size_t h = seed;
        for (char c : s) { h ^= static_cast<unsigned char>(c); h *= 0x517cc1b727220a95ULL; h ^= h >> 32; }
        return h;
    };

    for (std::size_t i = 0; i < dims; ++i) {
        float acc = 0.0f;
        std::size_t seed = seeds[i % SEEDS] ^ (i * 0x9e3779b9ULL);
        for (std::size_t ti = 0; ti < tokens.size(); ++ti) {
            const auto& tok = tokens[ti];
            std::size_t h   = hash_str(tok, seed);
            float       val = static_cast<float>(static_cast<int32_t>(h)) / float(1u << 31);
            acc += val;

            // Bigram context
            if (ti + 1 < tokens.size()) {
                std::size_t h2 = hash_str(tok + " " + tokens[ti + 1], seed ^ 0xdeadbeefULL);
                acc += 0.5f * static_cast<float>(static_cast<int32_t>(h2)) / float(1u << 31);
            }
        }
        v[i] = tokens.empty() ? 0.0f : acc / static_cast<float>(tokens.size());
    }

    // L2 normalise
    Eigen::Map<Eigen::VectorXf> ev(v.data(), dims);
    float norm = ev.norm();
    if (norm > 1e-8f) ev /= norm;

    return v;
}

} // namespace cerebro::ml
