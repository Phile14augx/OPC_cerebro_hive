import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { FeatureStoreService } from './feature-store.service';
import { GetOnlineFeaturesDto, GenerateOfflineDatasetDto, RegisterFeatureViewDto } from './dto/feature-store.dto';

@Controller('api/v1')
export class FeatureStoreController {
  constructor(private readonly featureStoreService: FeatureStoreService) {}

  @Post('serve/features')
  getOnlineFeatures(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: GetOnlineFeaturesDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.featureStoreService.getOnlineFeatures(tenantId, dto);
  }

  @Post('offline/datasets')
  generateOfflineDataset(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: GenerateOfflineDatasetDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.featureStoreService.generateOfflineDataset(tenantId, dto);
  }

  @Post('registry/feature-views')
  registerFeatureView(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: RegisterFeatureViewDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.featureStoreService.registerFeatureView(tenantId, dto);
  }
}
