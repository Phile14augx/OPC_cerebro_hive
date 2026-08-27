import { Module } from '@nestjs/common';
import { OntologyRegistryService } from './ontology-registry.service';

@Module({
  providers: [OntologyRegistryService],
  exports: [OntologyRegistryService],
})
export class OntologyRegistryModule {}
