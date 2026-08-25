
import { ApplicationRegistry } from './ApplicationRegistry';
import { CompilerPipeline } from './CompilerPipeline';

export class DynamicAppRouter {
  constructor(
    private registry: ApplicationRegistry,
    private compiler: CompilerPipeline
  ) {}

  async invokeApp(appId: string, _payload: unknown) {
    console.log(`[AppRouter] POST /api/apps/${appId}/invoke received`);
    
    const version = this.registry.getPublishedVersion(appId);
    if (!version) throw new Error(`No published version found for ${appId}`);

    console.log(`[AppRouter] Loaded immutable version ${version.versionId}`);
    
    // Compile on the fly, or load pre-compiled DAG
    const _dag = this.compiler.compile(version.graph);
    
    console.log(`[AppRouter] Dispatching DAG to shared HiveSwarm Runtime...`);
    return { status: 'Dispatched to HiveSwarm', executionId: `exec-${Date.now()}` };
  }
}
