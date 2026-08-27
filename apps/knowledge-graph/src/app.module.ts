import { Module } from '@nestjs/common';
import { GraphStorageModule } from './graph-storage/graph-storage.module';
import { OntologyRegistryModule } from './ontology-registry/ontology-registry.module';
import { QueryLayerModule } from './query-layer/query-layer.module';
import { EntityResolutionModule } from './entity-resolution/entity-resolution.module';
import { GraphEmbeddingModule } from './graph-embedding/graph-embedding.module';

@Module({
  imports: [
    GraphStorageModule,
    OntologyRegistryModule,
    QueryLayerModule,
    EntityResolutionModule,
    GraphEmbeddingModule,
  ],
})
export class AppModule {}
