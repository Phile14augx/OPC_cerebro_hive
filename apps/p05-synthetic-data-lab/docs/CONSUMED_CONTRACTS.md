# Consumed Contracts - P05 Synthetic Data Lab

## P01 Data Fabric
- **Ingestion Pipeline Events:** Listens to `p01.data.ingested` and `p01.pipeline.completed` to trigger synthetic data generation jobs for updated tables.
- **Data Access:** Reads baseline tabular and unstructured data via `FederatedQueryAPI` to build generative models.

## P02 Feature Intelligence
- **Feature Store Events:** Listens to `p02.feature_group.updated` to generate synthetic counterparts for feature sets.
- **Feature Access:** Reads feature definitions and distributions via `FeatureServingAPI`.
