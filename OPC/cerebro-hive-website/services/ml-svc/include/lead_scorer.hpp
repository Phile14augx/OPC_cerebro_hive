#pragma once

#include <string>
#include <unordered_map>
#include <vector>
#include <optional>

namespace cerebro::ml {

struct LeadFeatures {
    // Firmographic
    std::string industry;           // finance, healthcare, …
    std::string company_size;       // startup, smb, mid_market, enterprise
    std::string region;             // na, eu, apac, latam, mea

    // Behavioural
    int page_views{0};
    int session_count{0};
    int content_downloads{0};
    bool booked_demo{false};
    bool attended_webinar{false};
    bool academy_enrolled{false};

    // Intent
    std::string engagement_type;    // matches CRM EngagementType enum
    std::vector<std::string> products_viewed;
    std::vector<std::string> solutions_viewed;

    // Temporal
    int days_since_first_visit{0};
    int days_since_last_visit{0};
};

struct LeadScore {
    float score{0.0f};     // 0..100
    std::string grade;     // A, B, C, D
    std::string rationale;
    std::unordered_map<std::string, float> feature_contributions;
};

// ── LeadScorer ───────────────────────────────────────────────────────────────
// Logistic-regression–style linear model with hand-tuned weights.
// Replace weight vectors with trained parameters from an offline training job.

class LeadScorer {
public:
    LeadScorer();

    LeadScore score(const LeadFeatures& f) const;

private:
    float score_firmographic(const LeadFeatures& f) const;
    float score_behavioural(const LeadFeatures& f) const;
    float score_intent(const LeadFeatures& f) const;
    float score_temporal(const LeadFeatures& f) const;

    static std::string grade_from_score(float s);

    // Weights (loaded from config in production)
    std::unordered_map<std::string, float> industry_weights_;
    std::unordered_map<std::string, float> size_weights_;
    std::unordered_map<std::string, float> engagement_weights_;
};

} // namespace cerebro::ml
