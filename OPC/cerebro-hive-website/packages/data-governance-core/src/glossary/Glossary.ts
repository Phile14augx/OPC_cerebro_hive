export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  synonyms: string[];
  
  relatedDatasetIds: string[];
  relatedKpis: string[];
  relatedPolicies: string[];
}

export class BusinessGlossary {
  private terms = new Map<string, GlossaryTerm>();

  addTerm(term: GlossaryTerm) {
    this.terms.set(term.id, term);
  }

  getTerm(id: string): GlossaryTerm | undefined {
    return this.terms.get(id);
  }
}
