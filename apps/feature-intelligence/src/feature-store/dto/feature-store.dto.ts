import { IsString, IsArray, ValidateNested, IsOptional, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class TransformationPrimitiveDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  expression?: string;
}

export class GetOnlineFeaturesDto {
  @IsString()
  feature_service: string;

  @IsArray()
  @ArrayMinSize(1)
  entities: Record<string, string>[];
}

export class GenerateOfflineDatasetDto {
  @IsArray()
  @IsString({ each: true })
  feature_list: string[];

  @IsString()
  entity_dataframe_uri: string;

  @IsString()
  output_uri: string;

  @IsString()
  format: string;
}

export class RegisterFeatureViewDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  entities: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransformationPrimitiveDto)
  features: TransformationPrimitiveDto[];

  @IsString()
  transformation_query: string;
}
