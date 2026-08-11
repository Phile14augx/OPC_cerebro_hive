#include "lead_scorer.hpp"

#include <algorithm>
#include <cmath>
#include <sstream>
#include <numeric>

namespace cerebro::ml {

LeadScorer::LeadScorer() {
    // Industry weights — 0..1 scale reflecting ICP alignment
    industry_weights_ = {
        {"finance",       1.0f}, {"healthcare",    0.95f},
        {"government",    0.90f},{"manufacturing", 0.85f},
        {"insurance",     0.85f},{"technology",    0.80f},
        {"energy",        0.80f},{"logistics",     0.75f},
        {"telecom",       0.70f},{"education",     0.65f},
        {"retail",        0.60f},{"construction",  0.55f},
        {"real-estate",   0.50f},{"media",         0.45f},
        {"services",      0.40f},
    };

    // Company size — enterprise bias (higher ACV)
    size_weights_ = {
        {"enterprise",  1.0f}, {"mid_market", 0.75f},
        {"smb",         0.40f},{"startup",    0.20f},
    };

    // Engagement type — maps to purchase intent
    engagement_weights_ = {
        {"enterprise_ai",    1.0f}, {"workforce_automation",   0.90f},
        {"data_analytics",   0.85f},{"security_compliance",    0.85f},
        {"digital_transform",0.80f},{"ml_infrastructure",      0.75f},
        {"custom_ai",        0.70f},{"academy",                0.50f},
        {"general",          0.30f},
    };
}

LeadScore LeadScorer::score(const LeadFeatures& f) const {
    float firm = score_firmographic(f);
    float behv = score_behavioural(f);
    float intent = score_intent(f);
    float temporal = score_temporal(f);

    // Weighted blend (sum of weights = 1.0)
    float raw = (firm * 0.30f) + (behv * 0.35f) + (intent * 0.25f) + (temporal * 0.10f);

    // Clamp & scale to 0..100
    float final_score = std::clamp(raw * 100.0f, 0.0f, 100.0f);

    std::string rationale;
    if (final_score >= 80.0f) rationale = "High-intent enterprise lead with strong ICP alignment";
    else if (final_score >= 60.0f) rationale = "Warm lead showing behavioural signals — nurture recommended";
    else if (final_score >= 40.0f) rationale = "Early-stage interest — continue education sequence";
    else                           rationale = "Low intent — place in long-term nurture track";

    return LeadScore{
        .score  = final_score,
        .grade  = grade_from_score(final_score),
        .rationale = rationale,
        .feature_contributions = {
            {"firmographic",  firm  * 100.0f},
            {"behavioural",   behv  * 100.0f},
            {"intent",        intent * 100.0f},
            {"temporal",      temporal * 100.0f},
        },
    };
}

float LeadScorer::score_firmographic(const LeadFeatures& f) const {
    float score = 0.0f;

    auto ind_it = industry_weights_.find(f.industry);
    score += (ind_it != industry_weights_.end() ? ind_it->second : 0.3f) * 0.6f;

    auto sz_it = size_weights_.find(f.company_size);
    score += (sz_it != size_weights_.end() ? sz_it->second : 0.2f) * 0.4f;

    return std::clamp(score, 0.0f, 1.0f);
}

float LeadScorer::score_behavioural(const LeadFeatures& f) const {
    float score = 0.0f;

    // Digital footprint signals
    score += std::min(f.page_views / 20.0f, 1.0f) * 0.15f;
    score += std::min(f.session_count / 5.0f, 1.0f) * 0.15f;
    score += std::min(f.content_downloads / 3.0f, 1.0f) * 0.20f;

    // High-intent actions
    if (f.booked_demo)          score += 0.30f;
    if (f.attended_webinar)     score += 0.15f;
    if (f.academy_enrolled)     score += 0.05f;

    return std::clamp(score, 0.0f, 1.0f);
}

float LeadScorer::score_intent(const LeadFeatures& f) const {
    float score = 0.0f;

    auto eng_it = engagement_weights_.find(f.engagement_type);
    score += (eng_it != engagement_weights_.end() ? eng_it->second : 0.3f) * 0.50f;

    // Product breadth
    score += std::min(f.products_viewed.size() / 5.0f, 1.0f) * 0.25f;
    score += std::min(f.solutions_viewed.size() / 3.0f, 1.0f) * 0.25f;

    return std::clamp(score, 0.0f, 1.0f);
}

float LeadScorer::score_temporal(const LeadFeatures& f) const {
    // Recency: recently active leads score higher
    float recency = 1.0f - std::min(f.days_since_last_visit / 30.0f, 1.0f);
    // Engagement duration: longer engagement ≠ better (plateaus at 60 days)
    float duration = std::min(f.days_since_first_visit / 60.0f, 1.0f);

    return std::clamp(recency * 0.70f + duration * 0.30f, 0.0f, 1.0f);
}

std::string LeadScorer::grade_from_score(float s) {
    if (s >= 80.0f) return "A";
    if (s >= 60.0f) return "B";
    if (s >= 40.0f) return "C";
    return "D";
}

} // namespace cerebro::ml
