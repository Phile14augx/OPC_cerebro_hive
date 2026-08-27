import { Module } from '@nestjs/common';
import { QueryController } from './query/query.controller';
import { ApacheAgeAdapter } from './graph/adapters/apache-age.adapter';
import { OntologyService } from './ontology/ontology.service';

@Module({
  imports: [],
  controllers: [QueryController],
  providers: [ApacheAgeAdapter, OntologyService],
})
export class AppModule {}
