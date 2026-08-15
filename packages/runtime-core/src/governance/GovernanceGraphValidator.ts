import { GovernanceRule } from './GovernanceRule.js';

export class GovernanceGraphValidator {
  public static validate(rules: GovernanceRule[]): void {
    const ruleIds = new Set(rules.map(r => r.id));
    
    // 1. Check for Duplicate IDs
    if (ruleIds.size !== rules.length) {
      const duplicates = rules.map(r => r.id).filter((item, index, arr) => arr.indexOf(item) !== index);
      throw new Error(`GovernanceGraphValidator: Duplicate rule IDs found: ${duplicates.join(', ')}`);
    }

    // 2. Check for Missing Dependencies & Paradoxes
    for (const rule of rules) {
      if (rule.dependsOn) {
        const expectedStatuses = new Map<string, string>();
        for (const dep of rule.dependsOn) {
          const depId = typeof dep === 'string' ? dep : dep.ruleId;
          const when = typeof dep === 'string' ? 'Passed' : (dep.when || 'Passed');

          if (!ruleIds.has(depId)) {
            throw new Error(`GovernanceGraphValidator: Rule '${rule.id}' depends on missing rule '${depId}'`);
          }

          if (expectedStatuses.has(depId) && expectedStatuses.get(depId) !== when) {
            throw new Error(`GovernanceGraphValidator: Paradox detected - Rule '${rule.id}' depends on both Passed and Failed for rule '${depId}'`);
          }
          expectedStatuses.set(depId, when);
        }
      }
    }

    // 3. Check for Stage Violations (e.g. PreScoring depending on PostScoring)
    const ruleMap = new Map(rules.map(r => [r.id, r]));
    for (const rule of rules) {
      if (rule.dependsOn && rule.stage === 'PreScoring') {
        for (const dep of rule.dependsOn) {
          const depId = typeof dep === 'string' ? dep : dep.ruleId;
          const depRule = ruleMap.get(depId);
          if (depRule && depRule.stage === 'PostScoring') {
            throw new Error(`GovernanceGraphValidator: Stage Violation - PreScoring Rule '${rule.id}' cannot depend on PostScoring Rule '${depId}'`);
          }
        }
      }
    }

    // 4. Cycle Detection (DFS)
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const dfs = (nodeId: string, path: string[]) => {
      if (visiting.has(nodeId)) {
        throw new Error(`GovernanceGraphValidator: Dependency Cycle detected: ${path.join(' -> ')} -> ${nodeId}`);
      }
      if (visited.has(nodeId)) return;

      visiting.add(nodeId);
      path.push(nodeId);

      const rule = ruleMap.get(nodeId);
      if (rule && rule.dependsOn) {
        for (const dep of rule.dependsOn) {
          const depId = typeof dep === 'string' ? dep : dep.ruleId;
          dfs(depId, path);
        }
      }

      path.pop();
      visiting.delete(nodeId);
      visited.add(nodeId);
    };

    for (const rule of rules) {
      if (!visited.has(rule.id)) {
        dfs(rule.id, []);
      }
    }
  }
}
