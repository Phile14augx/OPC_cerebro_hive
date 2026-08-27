export class TransformationPrimitiveDto {
  name: string;
  type: string;
  expression?: string;
}

export class GetOnlineFeaturesDto {
  feature_service: string;
  entities: Record<string, string>[];
}

export class GenerateOfflineDatasetDto {
  feature_list: string[];
  entity_dataframe_uri: string;
  output_uri: string;
  format: string;
}

export class RegisterFeatureViewDto {
  name: string;
  entities: string[];
  features: TransformationPrimitiveDto[];
  transformation_query: string;
}
