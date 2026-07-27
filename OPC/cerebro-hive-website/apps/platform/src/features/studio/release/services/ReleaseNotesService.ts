
import { WorkflowVersion } from '../../lifecycle/WorkflowVersion';

export class ReleaseNotesService {
  static generateLayeredNotes(version: WorkflowVersion): string {
    const diff = version.diffFromParent;
    if (!diff) return '# Initial Release';

    return `
# Release Summary
Automated semantic release.

## Breaking Changes
${version.compatibilityReport?.breakingChanges.join('\n') || 'None'}

## Topological Changes
- Nodes Added: ${diff.nodesAdded.length}
- Nodes Removed: ${diff.nodesRemoved.length}

## Migration Notes
- Automatically migrated ${diff.typeSignaturesChanged.length} port signatures.

## Security Impact
- Required approvals automatically enforced by PolicyAdapter.
    `;
  }
}
