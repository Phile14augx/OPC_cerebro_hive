import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { ExperimentService } from '../../src/mlflow/experiment.service';
import { ModelRegistryService } from '../../src/mlflow/model-registry.service';

describe('MLflow API Integration', () => {
  let app: INestApplication;
  let baseUrl: string;
  let experiments: ExperimentService;
  let models: ModelRegistryService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.listen(0, '127.0.0.1');

    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}/api/2.0/mlflow`;
    experiments = app.get(ExperimentService);
    models = app.get(ModelRegistryService);
  });

  afterAll(async () => {
    await app.close();
  });

  async function request(path: string, method: 'POST' | 'PATCH', body: object) {
    return fetch(`${baseUrl}/${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('creates and persists an experiment through the HTTP API', async () => {
    const response = await request('experiments/create', 'POST', { name: 'http-experiment' });

    expect(response.status).toBe(201);
    const experiment = await response.json() as { id: string; name: string };
    expect(experiment).toEqual({ id: '1', name: 'http-experiment' });
    expect(experiments.getExperiment(experiment.id)).toEqual(experiment);
  });

  it('logs a parameter and metric to a run through the HTTP API', async () => {
    const experimentResponse = await request('experiments/create', 'POST', { name: 'logging-experiment' });
    const experiment = await experimentResponse.json() as { id: string };
    const runResponse = await request('runs/create', 'POST', { experiment_id: experiment.id });
    const run = await runResponse.json() as { id: string };

    const parameterResponse = await request('runs/log-parameter', 'POST', {
      run_id: run.id,
      key: 'optimizer',
      value: 'adam',
    });
    const metricResponse = await request('runs/log-metric', 'POST', {
      run_id: run.id,
      key: 'accuracy',
      value: 0.97,
    });

    expect(parameterResponse.status).toBe(201);
    expect(metricResponse.status).toBe(201);
    expect(experiments.getRun(run.id).params).toEqual({ optimizer: 'adam' });
    expect(experiments.getRun(run.id).metrics).toEqual({ accuracy: 0.97 });
  });

  it('transitions and persists a model version stage through the HTTP API', async () => {
    await request('registered-models/create', 'POST', { name: 'fraud-detector' });
    await request('model-versions/create', 'POST', { name: 'fraud-detector', run_id: 'run-42' });

    const response = await request('model-versions/transition-stage', 'PATCH', {
      name: 'fraud-detector',
      version: 1,
      stage: 'Production',
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      modelName: 'fraud-detector',
      runId: 'run-42',
      stage: 'Production',
      version: 1,
    });
    expect(models.listModelVersions('fraud-detector')[0].stage).toBe('Production');
  });
});
