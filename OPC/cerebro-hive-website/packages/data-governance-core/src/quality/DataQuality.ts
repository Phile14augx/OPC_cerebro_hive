export interface QualityDimension {
  dimension: 'Completeness' | 'Accuracy' | 'Consistency' | 'Freshness' | 'Uniqueness' | 'Validity';
  score: number; // 0-100
  lastMeasuredAt: Date;
}

export interface DataQualityRule {
  id: string;
  datasetId: string;
  dimension: QualityDimension['dimension'];
  name: string;
  description: string;
  executionTarget: string; // e.g., 'dbt-core-pipeline' or 'GreatExpectations'
}

export interface DatasetQualityProfile {
  datasetId: string;
  dimensions: QualityDimension[];
  overallScore: number; // Derived from dimensions
}

export class QualityManager {
  private rules = new Map<string, DataQualityRule[]>();
  private profiles = new Map<string, DatasetQualityProfile>();

  registerRule(rule: DataQualityRule) {
    const existing = this.rules.get(rule.datasetId) || [];
    existing.push(rule);
    this.rules.set(rule.datasetId, existing);
  }

  updateProfile(profile: DatasetQualityProfile) {
    // Derive overall score as average
    if (profile.dimensions.length > 0) {
      profile.overallScore = profile.dimensions.reduce((acc, curr) => acc + curr.score, 0) / profile.dimensions.length;
    } else {
      profile.overallScore = 0;
    }
    this.profiles.set(profile.datasetId, profile);
  }

  getProfile(datasetId: string): DatasetQualityProfile | undefined {
    return this.profiles.get(datasetId);
  }
}
