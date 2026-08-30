import { UnauthorizedException, Injectable } from '@nestjs/common';
import { IFederationEngine } from '../../../p01-data-fabric/src/federation/engines/federation.interface';
import { FeatureStoreService } from '../../../p02-feature-intelligence/src/feature-store/feature-store.service';
import { ExecutionContext } from '../../../../packages/runtime-core/src/context/ExecutionContext';
import { PrivacyValidator } from '../privacy/privacy.validator';
import { TabularSynthesizer } from '../synthesis/tabular-synthesizer';

@Injectable()
export class GenerationService {
  constructor(
    private readonly federationEngine: IFederationEngine,
    private readonly featureStoreService: FeatureStoreService,
    private readonly privacyValidator: PrivacyValidator
  ) {}

  async triggerGeneration(
    payload: { 
      id: string; 
      type: string; 
      schema: any; 
      targetRows: number; 
      sourceQuery?: string; 
      featureService?: string;
      privacy?: { k: number; quasiIdentifiers?: string[] };
    }, 
    context: ExecutionContext
  ) {
    if (!context || !context.tenantId) {
      throw new UnauthorizedException('Zero-trust policy violation: missing tenantId in execution context');
    }

    if (!payload || !payload.id || !payload.schema || typeof payload.targetRows !== 'number') {
      throw new Error('Invalid generation payload');
    }

    let baselineDataCount = 0;
    if (payload.sourceQuery) {
      const data = await this.federationEngine.query(payload.sourceQuery);
      baselineDataCount = data.length;
    }

    let usedFeatures = null;
    if (payload.featureService) {
      // Mock entities to request features for
      const entities = [{ id: 1 }, { id: 2 }];
      const featureResult = this.featureStoreService.getOnlineFeatures(payload.featureService, entities);
      usedFeatures = featureResult.results;
    }

    const synthesizer = new TabularSynthesizer();
    const dataset = synthesizer.generate({
      columns: payload.schema.columns || [],
      targetRows: payload.targetRows,
      columnConfig: payload.schema.columnConfig
    });

    const privacyConfig = payload.privacy || { k: 1 };
    const evaluationResult = this.privacyValidator.evaluate(dataset, privacyConfig);
    if (!evaluationResult.compliant) {
      throw new Error('Privacy evaluation failed on generated dataset');
    }

    return {
      id: payload.id,
      status: 'completed',
      result: {
        rows: payload.targetRows,
        schema: payload.schema,
        tenantId: context.tenantId,
        usedFeatures,
        baselineDataCount,
        privacyCompliant: evaluationResult.compliant,
        data: dataset
      }
    };
  }
}
