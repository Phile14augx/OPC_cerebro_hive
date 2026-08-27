import { Controller, Post, Body } from '@nestjs/common';
import { FeatureStoreService } from './feature-store.service';

@Controller('api/v1')
export class FeatureStoreController {
  constructor(private readonly featureStoreService: FeatureStoreService) {}

  @Post('serve/features')
  getOnlineFeatures(@Body() req: any) {
    return this.featureStoreService.getOnlineFeatures(req.feature_service, req.entities);
  }

  @Post('offline/datasets')
  generateOfflineDataset(@Body() req: any) {
    return this.featureStoreService.generateOfflineDataset(req);
  }

  @Post('registry/feature-views')
  registerFeatureView(@Body() req: any) {
    return this.featureStoreService.registerFeatureView(req);
  }
}
