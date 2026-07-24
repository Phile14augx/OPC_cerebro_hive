import { Dataset, DatasetClassification } from '../catalog/Dataset';
import { LineageGraph } from '../lineage/LineageGraph';

export class ClassificationPropagator {
  constructor(private lineageGraph: LineageGraph, private catalog: Map<string, Dataset>) {}

  /**
   * Propagates a classification from a source dataset to all downstream datasets.
   * If a downstream dataset has a lower sensitivity, it is upgraded.
   */
  propagate(sourceDatasetId: string): void {
    const sourceDataset = this.catalog.get(sourceDatasetId);
    if (!sourceDataset) throw new Error('Source dataset not found');

    const downstreamIds = this.lineageGraph.getDownstreamImpact(sourceDatasetId);
    
    for (const id of downstreamIds) {
      const targetDataset = this.catalog.get(id);
      if (targetDataset) {
        this.mergeClassifications(sourceDataset.classification, targetDataset);
      }
    }
  }

  private mergeClassifications(source: DatasetClassification, target: Dataset): void {
    const sensitivities = ['Public', 'Internal', 'Confidential', 'Restricted'];
    const sourceLevel = sensitivities.indexOf(source.sensitivity);
    const targetLevel = sensitivities.indexOf(target.classification.sensitivity);

    let upgraded = false;

    // 1. Upgrade Sensitivity
    if (sourceLevel > targetLevel) {
      target.classification.sensitivity = source.sensitivity;
      upgraded = true;
    }

    // 2. Propagate PII/PHI
    if (source.containsPII && !target.classification.containsPII) {
      target.classification.containsPII = true;
      upgraded = true;
    }
    if (source.containsPHI && !target.classification.containsPHI) {
      target.classification.containsPHI = true;
      upgraded = true;
    }

    // 3. Propagate Residency constraints
    const newResidencies = source.residency.filter(r => !target.classification.residency.includes(r));
    if (newResidencies.length > 0) {
      target.classification.residency.push(...newResidencies);
      upgraded = true;
    }

    if (upgraded) {
      console.log(`[ClassificationPropagator] 🏷️ Upgraded classification for downstream dataset: ${target.name}`);
    }
  }
}
