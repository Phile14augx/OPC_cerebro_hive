import { describe, expect, it } from 'vitest';
import type { AssessmentSchema } from '../types';
import { AssessmentCompiler } from './index';

function validSchema(): AssessmentSchema {
  return {
    id: 'assessment-1',
    version: 1,
    title: 'Assessment',
    description: 'Assessment description',
    companyId: 'company-1',
    difficulty: 'beginner',
    estimatedTimeMinutes: 30,
    tags: [],
    resources: {
      starter: { id: 'starter', type: 'starter_code', name: 'Starter code', content: 'export {}' },
    },
    rubrics: {},
    sections: [{
      id: 'section-1',
      title: 'Section',
      activities: [{
        id: 'activity-1',
        title: 'Activity',
        widgets: [{
          id: 'widget-1',
          type: 'markdown',
          title: 'Prompt',
          required: true,
          content: 'Describe your approach.',
        }],
      }],
    }],
  };
}

describe('AssessmentCompiler', () => {
  it('deep-freezes the signed assessment schema', async () => {
    const assessmentPackage = await new AssessmentCompiler().compile(validSchema(), 'author-1');

    expect(() => {
      assessmentPackage.schema.sections[0].activities[0].widgets[0].title = 'tampered';
    }).toThrow(TypeError);
  });

  it('rejects malformed resource objects before resolving them', async () => {
    const malformedSchema = { ...validSchema(), resources: { starter: null } };
    const compiler = new AssessmentCompiler();

    await expect(Reflect.apply(compiler.compile, compiler, [malformedSchema, 'author-1']))
      .rejects.toThrow('Assessment schema is invalid');
  });
});
