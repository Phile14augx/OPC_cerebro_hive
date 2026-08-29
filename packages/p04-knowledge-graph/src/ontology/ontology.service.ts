import { Injectable } from '@nestjs/common';

@Injectable()
export class OntologyService {
  async getActiveOntology(): Promise<any> {
    return {
      nodes: ['Person', 'Department', 'Product', 'Process', 'Document'],
      edges: ['WORKS_IN', 'MANAGES', 'OWNS', 'UTILIZES', 'MENTIONS']
    };
  }
}
