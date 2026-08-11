import { TrendIntelligenceEngine, TrendLifecycle } from "./trend.js";

// ---------------------------------------------------------------------------------------------
// Trend Forecast Engine
// ---------------------------------------------------------------------------------------------

export interface TrendForecast {
  projectedGrowth: string; // e.g. "+150% YoY"
  confidence: number;      // 0-100
  risk: string;            // e.g. "High - Dependent on hardware advances"
  enterpriseAdoption: string; // e.g. "Early Majority in 12 months"
  marketSize: string;      // e.g. "$5B by 2028"
}

export class TrendForecastEngine {
  private trendEngine: TrendIntelligenceEngine;

  constructor(trendEngine: TrendIntelligenceEngine) {
    this.trendEngine = trendEngine;
  }

  /**
   * Deterministically predicts the future state of a trend.
   */
  forecast(entityId: string): TrendForecast {
    const trend = this.trendEngine.calculateTrendScore(entityId);
    
    // Seeded random
    let h = 0;
    for (let i = 0; i < entityId.length; i++) h = Math.imul(31, h) + entityId.charCodeAt(i) | 0;
    let s = h;
    const rand = () => { s = Math.imul(1664525, s) + 1013904223 | 0; return (s >>> 0) / 4294967296; };

    let projectedGrowth = "";
    let enterpriseAdoption = "";
    let risk = "Moderate";
    let marketSizeBase = 100 + rand() * 900; // $100M - $1B

    switch (trend.lifecycle) {
      case "Emerging":
        projectedGrowth = `+${Math.floor(200 + rand() * 300)}% YoY`;
        enterpriseAdoption = "Innovators only (1-2% penetration)";
        risk = "High - Unproven ROI at scale";
        marketSizeBase *= 0.1;
        break;
      case "Growing":
        projectedGrowth = `+${Math.floor(100 + rand() * 150)}% YoY`;
        enterpriseAdoption = "Early Adopters (5-10% penetration)";
        risk = "High - Rapidly changing landscape";
        marketSizeBase *= 0.5;
        break;
      case "Accelerating":
        projectedGrowth = `+${Math.floor(50 + rand() * 80)}% YoY`;
        enterpriseAdoption = "Early Majority in 12-18 months";
        risk = "Moderate - Supply chain / talent constraints";
        marketSizeBase *= 2.0;
        break;
      case "Mainstream":
        projectedGrowth = `+${Math.floor(20 + rand() * 30)}% YoY`;
        enterpriseAdoption = "Late Majority (50%+ penetration)";
        risk = "Low - Established vendor ecosystem";
        marketSizeBase *= 5.0;
        break;
      case "Mature":
        projectedGrowth = `+${Math.floor(5 + rand() * 10)}% YoY`;
        enterpriseAdoption = "Laggards adopting";
        risk = "Low - Commoditized";
        marketSizeBase *= 4.0;
        break;
      case "Declining":
        projectedGrowth = `-${Math.floor(10 + rand() * 20)}% YoY`;
        enterpriseAdoption = "Migrating to newer paradigms";
        risk = "High - Technical debt accumulation";
        marketSizeBase *= 1.0;
        break;
      case "Legacy":
        projectedGrowth = `-50%+ YoY`;
        enterpriseAdoption = "End of life planning";
        risk = "High - Lack of talent / support";
        marketSizeBase *= 0.1;
        break;
    }

    return {
      projectedGrowth,
      confidence: Math.floor(40 + trend.overallScore * 0.5 + rand() * 10),
      risk,
      enterpriseAdoption,
      marketSize: `$${marketSizeBase.toFixed(1)}M by 2028`
    };
  }
}

// ---------------------------------------------------------------------------------------------
// Product Generator Integration
// ---------------------------------------------------------------------------------------------

export class ProductIntelligenceIntegration {
  private forecastEngine: TrendForecastEngine;

  constructor(forecastEngine: TrendForecastEngine) {
    this.forecastEngine = forecastEngine;
  }

  generateInnovationGaps(entityIds: string[]) {
    const gaps = [];
    for (const id of entityIds) {
      const forecast = this.forecastEngine.forecast(id);
      
      if (forecast.confidence > 70 && forecast.risk.includes("High")) {
        gaps.push({
          entityId: id,
          gap: "Risk Mitigation Tooling",
          rationale: "High enterprise demand but blocked by significant risk factors."
        });
      }
      
      if (forecast.projectedGrowth.includes("+2") || forecast.projectedGrowth.includes("+3")) {
        gaps.push({
          entityId: id,
          gap: "Talent / Enablement",
          rationale: "Growth velocity will outpace available engineering talent."
        });
      }
    }
    return gaps;
  }
}
