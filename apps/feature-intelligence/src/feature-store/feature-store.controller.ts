import { Controller, Post, Body } from '@nestjs/common';
import { FeatureStoreService } from './feature-store.service';
import { GetOnlineFeaturesDto, GenerateOfflineDatasetDto, RegisterFeatureViewDto } from './dto/feature-store.dto';

@Controller('api/v1')
export class FeatureStoreController {
  constructor(private readonly featureStoreService: FeatureStoreService) {}

  @Post('serve/features')
  getOnlineFeatures(@Body() dto: GetOnlineFeaturesDto) {
    return this.featureStoreService.getOnlineFeatures(dto);
  }

  @Post('offline/datasets')
  generateOfflineDataset(@Body() dto: GenerateOfflineDatasetDto) {
    return this.featureStoreService.generateOfflineDataset(dto);
  }

  @Post('registry/feature-views')
  registerFeatureView(@Body() dto: RegisterFeatureViewDto) {
    return this.featureStoreService.registerFeatureView(dto);
  }
}
