export interface PromptVersionDTO {
  id: string;
  promptTemplateId: string;
  version: number;
  content: string;
  variables: string[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'deprecated' | 'archived';
  evaluationScores: any;
}

export class PromptRegistry {
  constructor(private db: any) {}

  async getPublishedVersion(templateName: string): Promise<PromptVersionDTO | null> {
    const template = await this.db.promptTemplate.findUnique({
      where: { name: templateName },
      include: {
        versions: {
          where: { status: 'published' },
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!template || template.versions.length === 0) return null;
    return template.versions[0] as PromptVersionDTO;
  }

  async getVersion(id: string): Promise<PromptVersionDTO | null> {
    const version = await this.db.promptVersion.findUnique({ where: { id } });
    return version as PromptVersionDTO | null;
  }
}
