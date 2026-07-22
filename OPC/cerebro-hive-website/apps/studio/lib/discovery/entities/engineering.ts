import { SITE_URL } from '../config';
import type { DiscoveryEntity } from '../knowledge-graph/types';

export const ENTITY_MLOPS: DiscoveryEntity = {
  name: 'MLOps',
  description: 'Machine Learning Operations — practices combining ML, DevOps, and data engineering to deploy, monitor, and maintain ML models in production reliably and at enterprise scale.',
  url: `${SITE_URL}/services/aiops`,
};

export const ENTITY_DATA_ENGINEERING: DiscoveryEntity = {
  name: 'Data Engineering',
  description: 'The discipline of designing and building systems that collect, store, transform, and serve data reliably for analytics and AI model training — including pipelines, lakehouses, and feature stores.',
  url: `${SITE_URL}/services/ai-platform-engineering`,
};

export const ENTITY_AI_PLATFORM: DiscoveryEntity = {
  name: 'AI Platform Engineering',
  description: 'The design and construction of scalable, secure infrastructure for running AI workloads — including GPU clusters, vector databases, model serving, and observability systems.',
  url: `${SITE_URL}/services/ai-platform-engineering`,
};

export const ENTITY_AIOPS: DiscoveryEntity = {
  name: 'AIOps',
  description: 'AI for IT Operations — using AI and ML to automate IT monitoring, event correlation, root cause analysis, and incident response, reducing mean time to resolution.',
  url: `${SITE_URL}/services/aiops`,
};
