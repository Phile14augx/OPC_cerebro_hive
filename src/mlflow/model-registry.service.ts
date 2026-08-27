import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export interface Model {
  name: string;
}

export type ModelStage = 'None' | 'Staging' | 'Production' | 'Archived';

export interface ModelVersion {
  version: number;
  modelName: string;
  runId: string;
  stage: ModelStage;
}

@Injectable()
export class ModelRegistryService {
  private models: Map<string, Model> = new Map();
  private versions: ModelVersion[] = [];

  registerModel(name: string): Model {
    if (this.models.has(name)) {
      throw new BadRequestException('Model already exists');
    }
    const model = { name };
    this.models.set(name, model);
    return model;
  }

  createModelVersion(modelName: string, runId: string): ModelVersion {
    if (!this.models.has(modelName)) {
      throw new NotFoundException('Model not found');
    }
    const modelVersions = this.versions.filter(v => v.modelName === modelName);
    const nextVersion = modelVersions.length > 0 ? Math.max(...modelVersions.map(v => v.version)) + 1 : 1;
    
    const version: ModelVersion = {
      version: nextVersion,
      modelName,
      runId,
      stage: 'None'
    };
    this.versions.push(version);
    return version;
  }

  transitionModelVersionStage(modelName: string, version: number, stage: ModelStage): ModelVersion {
    const mv = this.versions.find(v => v.modelName === modelName && v.version === version);
    if (!mv) {
      throw new NotFoundException('Model version not found');
    }
    mv.stage = stage;
    return mv;
  }

  listModelVersions(modelName: string): ModelVersion[] {
    if (!this.models.has(modelName)) {
      throw new NotFoundException('Model not found');
    }
    return this.versions.filter(v => v.modelName === modelName);
  }
}
