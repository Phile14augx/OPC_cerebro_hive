
import { ApplicationGraph } from './VisualSchema';

export interface AppVersion {
  versionId: string;
  graph: ApplicationGraph;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
}

export class ApplicationRegistry {
  private versions = new Map<string, AppVersion[]>();

  publishVersion(appId: string, graph: ApplicationGraph, status: 'DRAFT' | 'PUBLISHED'): string {
    const versionId = `v${Date.now()}`;
    const newVersion: AppVersion = {
      versionId,
      graph,
      status,
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined
    };

    const existing = this.versions.get(appId) || [];
    existing.push(newVersion);
    this.versions.set(appId, existing);
    
    console.log(`[AppRegistry] ${status} version ${versionId} created for app ${appId}`);
    return versionId;
  }

  getPublishedVersion(appId: string): AppVersion | undefined {
    const versions = this.versions.get(appId) || [];
    return versions.find(v => v.status === 'PUBLISHED');
  }
}
