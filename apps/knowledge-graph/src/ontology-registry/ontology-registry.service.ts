import { Injectable } from '@nestjs/common';

export interface EntitySchema {
  label: string;
  fields: Record<string, string>;
}

@Injectable()
export class OntologyRegistryService {
  async getActiveOntology(): Promise<{ entities: EntitySchema[], relationships: string[] }> {
    return {
      entities: [
        { label: 'Person', fields: { employeeId: 'string', name: 'string' } },
        { label: 'Department', fields: { departmentId: 'string', name: 'string' } }
      ],
      relationships: ['WORKS_IN', 'MANAGES']
    };
  }

  async validateNode(label: string, properties: Record<string, any>): Promise<boolean> {
    const ontology = await this.getActiveOntology();
    const schema = ontology.entities.find(e => e.label === label);
    if (!schema) return false;
    for (const key of Object.keys(properties)) {
      if (!schema.fields[key]) return false;
    }
    return true;
  }
}