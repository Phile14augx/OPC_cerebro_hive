import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { ModelDeploymentService } from '../../src/execution/model-deployment.service';
import { ExperimentService } from '../../src/mlflow/experiment.service';
import { ModelRegistryService } from '../../src/mlflow/model-registry.service';

describe('Pipeline Execution Integration', () => {
  let moduleRef: TestingModule;
  let deployments: ModelDeploymentService;
  let experiments: ExperimentService;
  let models: ModelRegistryService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    deployments = moduleRef.get(ModelDeploymentService);
    experiments = moduleRef.get(ExperimentService);
    models = moduleRef.get(ModelRegistryService);
  });

  it('submits a valid pipeline when a registered model enters Production', async () => {
    const experiment = experiments.createExperiment('deployment-experiment');
    const run = experiments.createRun(experiment.id);
    models.registerModel('recommendation-model');
    const modelVersion = models.createModelVersion('recommendation-model', run.id);
    const productionVersion = models.transitionModelVersionStage(
      modelVersion.modelName,
      modelVersion.version,
      'Production',
    );

    const result = await deployments.handleModelStageTransition({
      ...productionVersion,
      pipeline: {
        steps: [
          { name: 'package' },
          { name: 'deploy', dependsOn: ['package'] },
        ],
      },
    });

    expect(result).toEqual({
      executionId: 'model-deployment-0001',
      executionOrder: ['package', 'deploy'],
      status: 'SUBMITTED',
    });
    expect(experiments.getRun(run.id)).toMatchObject({
      status: 'SUBMITTED',
      tags: {
        'deployment.execution_id': 'model-deployment-0001',
        'deployment.model': 'recommendation-model',
        'deployment.model_version': '1',
      },
    });

    const secondSubmission = await deployments.handleModelStageTransition({
      ...productionVersion,
      pipeline: { steps: [{ name: 'deploy' }] },
    });
    expect(secondSubmission?.executionId).toBe('model-deployment-0002');
  });

  it('persists FAILED on the originating run and rethrows pipeline errors', async () => {
    const experiment = experiments.createExperiment('failed-deployment-experiment');
    const run = experiments.createRun(experiment.id);
    models.registerModel('invalid-model');
    const modelVersion = models.createModelVersion('invalid-model', run.id);
    const productionVersion = models.transitionModelVersionStage(
      modelVersion.modelName,
      modelVersion.version,
      'Production',
    );

    await expect(deployments.handleModelStageTransition({
      ...productionVersion,
      pipeline: {
        steps: [{ name: 'deploy', dependsOn: ['missing-package'] }],
      },
    })).rejects.toThrow('Missing dependency: missing-package');

    expect(experiments.getRun(run.id)).toMatchObject({
      status: 'FAILED',
      tags: { 'deployment.error': 'Missing dependency: missing-package' },
    });
  });
});
