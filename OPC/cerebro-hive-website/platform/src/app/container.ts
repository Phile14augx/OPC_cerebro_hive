import { loadConfig, type PlatformConfig } from "../kernel/config/config.js";
import { createLogger, type Logger } from "../kernel/logging/logger.js";
import { InMemorySpanExporter, Metrics, Tracer, type Telemetry } from "../kernel/telemetry/telemetry.js";
import { createEventBus } from "../kernel/events/factory.js";
import type { EventBus } from "../kernel/events/events.js";
import { PolicyEngine } from "../kernel/policy/policy.js";
import { IdentityService, type IdentityRepository } from "../kernel/identity/identity.js";
import { InMemoryIdentityRepository } from "../kernel/identity/in-memory.js";
import { PgIdentityRepository } from "../kernel/identity/pg.js";
import { AuditService, InMemoryAuditRepository, type AuditRepository } from "../kernel/governance-audit/audit.js";
import { PgAuditRepository } from "../kernel/governance-audit/pg.js";
import { createDb, type Db } from "../kernel/persistence/db.js";
import { migrate } from "../kernel/persistence/migrate.js";
import { SnapshotPersistence, arraySnapshot, comboSnapshot, mapSnapshot } from "../kernel/persistence/snapshots.js";
import { InMemoryFeatureFlags } from "../kernel/flags/flags.js";

import { XGateway } from "../ai/x/gateway.js";
import { MockProvider } from "../ai/x/mock-provider.js";
import { AnthropicProvider, OllamaProvider, OpenAiProvider } from "../ai/x/http-providers.js";
import { InMemoryAiCallRepository } from "../ai/x/types.js";
import { MixtureOfExperts } from "../ai/moe/moe.js";
import { HashedProjectionModel } from "../ai/representation/representation.js";
import { InMemoryWorldRepository, WorldModel } from "../ai/world/world.js";
import { AgentExecutor } from "../ai/chains/chains.js";
import { InMemoryRouterRepository, ModelRouter } from "../ai/router/router.js";

import { InMemoryMemoryRepository, MemoryFabric } from "../domains/memory/memory.js";
import { InMemoryKnowledgeRepository, KnowledgeFabric } from "../domains/knowledge/knowledge.js";
import { GuardService, InMemoryGuardEventRepository } from "../domains/guard/guard.js";
import { InMemoryRuntimeRepository, RuntimeService, Scheduler } from "../domains/runtime/runtime.js";
import { CalculatorTool, CatalogTool, KnowledgeSearchTool, MemorySearchTool, ToolRegistry } from "../domains/runtime/tools.js";
import { ContextEngine, builtinAssemblers } from "../domains/context/context-engine.js";
import { InMemoryAgentRepository, MeshService, agentosBridgeHandler } from "../domains/mesh/mesh.js";
import { FlowService, InMemoryFlowRepository } from "../domains/flow/flow.js";
import { GovernanceService, InMemoryApprovalRepository } from "../domains/governance/governance.js";
import { EthicsService, InMemoryRegistryRepository, RegistryService } from "../domains/governance/registries.js";
import { InMemoryOntologyRepository, OntologyService } from "../domains/knowledge/ontology.js";
import { InMemoryWeb3Repository, Web3Service } from "../domains/web3/web3.js";
import { EvalService, InMemoryEvalRepository } from "../domains/evaluation/evaluation.js";
import { ObservatoryService } from "../domains/observatory/observatory.js";
import { ConnectService, InMemoryConnectorRepository } from "../domains/connect/connect.js";
import { InMemoryInsightRepository, IntelligenceHub } from "../domains/hub/hub.js";
import { InMemorySimulationRepository, SimulatorService } from "../domains/simulator/simulator.js";
import { InMemoryNotificationRepository, SphereService } from "../domains/sphere/sphere.js";
import { ConsultingService, InMemoryConsultingRepository } from "../domains/consulting/consulting.js";
import { DevOpsService, InMemoryDevOpsRepository } from "../domains/devops/devops.js";
import { InMemoryMlopsRepository, MlopsService } from "../domains/mlops/mlops.js";
import { InMemorySecOpsRepository, SecOpsService } from "../domains/secops/secops.js";
import { AiopsService, InMemoryAiopsRepository } from "../domains/aiops/aiops.js";
import { CompilerService, InMemoryCompilerRepository } from "../domains/compiler/compiler.js";
import { InMemorySwarmRepository, SwarmService } from "../domains/swarm/swarm.js";
import { ActionsService, InMemoryActionsRepository } from "../domains/actions/actions.js";
import { systemContext } from "../kernel/context/context.js";

export interface Platform {
  config: PlatformConfig;
  logger: Logger;
  telemetry: Telemetry;
  bus: EventBus;
  policy: PolicyEngine;
  identity: IdentityService;
  audit: AuditService;
  flags: InMemoryFeatureFlags;
  db?: Db;
  snapshots?: SnapshotPersistence;
  x: XGateway;
  moe: MixtureOfExperts;
  world: WorldModel;
  memory: MemoryFabric;
  knowledge: KnowledgeFabric;
  guard: GuardService;
  runtime: RuntimeService;
  scheduler: Scheduler;
  tools: ToolRegistry;
  contextEngine: ContextEngine;
  mesh: MeshService;
  flow: FlowService;
  governance: GovernanceService;
  registries: RegistryService;
  ethics: EthicsService;
  ontology: OntologyService;
  web3: Web3Service;
  evals: EvalService;
  observatory: ObservatoryService;
  connect: ConnectService;
  hub: IntelligenceHub;
  simulator: SimulatorService;
  sphere: SphereService;
  consulting: ConsultingService;
  devops: DevOpsService;
  mlops: MlopsService;
  secops: SecOpsService;
  aiops: AiopsService;
  agentExecutor: AgentExecutor;
  router: ModelRouter;
  compiler: CompilerService;
  swarm: SwarmService;
  actions: ActionsService;
  shutdown(): Promise<void>;
}

export interface BuildOptions { config?: Partial<PlatformConfig>; withDatabase?: boolean; startScheduler?: boolean }

export async function buildPlatform(opts: BuildOptions = {}): Promise<Platform> {
  const config = { ...loadConfig(), ...opts.config } as PlatformConfig;
  const logger = createLogger(config.LOG_LEVEL, "cerebro-platform");
  const exporter = new InMemorySpanExporter();
  const telemetry: Telemetry = { tracer: new Tracer(exporter), metrics: new Metrics(), logger };
  const bus = await createEventBus(config, logger);
  const policy = new PolicyEngine();
  const flags = new InMemoryFeatureFlags();

  let db: Db | undefined;
  let identityRepo: IdentityRepository = new InMemoryIdentityRepository();
  let auditRepo: AuditRepository = new InMemoryAuditRepository();
  let snapshots: SnapshotPersistence | undefined;

  if (opts.withDatabase) {
    const applied = await migrate(config.DATABASE_URL);
    if (applied.length) logger.info({ applied }, "database migrations applied");
    db = createDb(config.DATABASE_URL);
    identityRepo = new PgIdentityRepository(db);
    auditRepo = new PgAuditRepository(db);
    snapshots = new SnapshotPersistence(config.DATABASE_URL, logger);
  }

  const identity = new IdentityService(identityRepo);
  const audit = new AuditService(auditRepo, bus);

  const aiCalls = new InMemoryAiCallRepository();
  const providers = [new MockProvider(), new OllamaProvider(config.OLLAMA_URL)] as ConstructorParameters<typeof XGateway>[0]["providers"];
  if (config.OPENAI_API_KEY) providers.push(new OpenAiProvider(config.OPENAI_API_KEY));
  if (config.ANTHROPIC_API_KEY) providers.push(new AnthropicProvider(config.ANTHROPIC_API_KEY));
  const x = new XGateway(
    { providers, defaultProvider: config.X_DEFAULT_PROVIDER, fallbackOrder: ["mock"] },
    aiCalls, bus, telemetry,
  );
  x.prompts.register("*", "grounded-answer", "Answer strictly from sources:\n{{sources}}\n\nQuestion: {{question}}");
  x.prompts.register("*", "summarize", "Summarize the following, keeping names, numbers, decisions:\n{{content}}");

  const representation = new HashedProjectionModel();
  const worldRepo = new InMemoryWorldRepository();
  const world = new WorldModel(worldRepo, representation);
  world.attach(bus);

  const memoryRepo = new InMemoryMemoryRepository();
  const memory = new MemoryFabric(memoryRepo, x, bus, policy);
  const knowledgeRepo = new InMemoryKnowledgeRepository();
  const knowledge = new KnowledgeFabric(knowledgeRepo, x, bus, policy);
  const guardRepo = new InMemoryGuardEventRepository();
  const guard = new GuardService(guardRepo, bus, telemetry);

  const tools = new ToolRegistry();
  tools.register(new CalculatorTool());
  tools.register(new CatalogTool());
  tools.register(new MemorySearchTool(memory));
  tools.register(new KnowledgeSearchTool(knowledge));

  const runtimeRepo = new InMemoryRuntimeRepository();
  const runtime = new RuntimeService({ repo: runtimeRepo, bus, x, tools, memory, guard, policy, telemetry });
  const scheduler = new Scheduler(runtime);

  const contextEngine = new ContextEngine();
  for (const a of builtinAssemblers(memory, knowledge, world)) contextEngine.register(a);

  const meshRepo = new InMemoryAgentRepository();
  const mesh = new MeshService(meshRepo, bus, policy);
  mesh.registerHandler("internal", async (ctx, _agent, task) => {
    const exec = await runtime.submit(ctx, { goal: task });
    const done = await runtime.execute(exec);
    return done.result?.output ?? `execution ${done.status}: ${done.error ?? "no output"}`;
  });
  mesh.registerHandler("external", agentosBridgeHandler(config.AGENTOS_URL));

  const approvalsRepo = new InMemoryApprovalRepository();
  const governance = new GovernanceService(approvalsRepo, bus, policy, audit);
  const registryRepo = new InMemoryRegistryRepository();
  const registries = new RegistryService(registryRepo, bus, policy);
  const ethics = new EthicsService();
  const ontologyRepo = new InMemoryOntologyRepository();
  const ontology = new OntologyService(ontologyRepo, bus, policy);
  const web3Repo = new InMemoryWeb3Repository();
  const web3 = new Web3Service(web3Repo, bus, policy);
  const flowRepo = new InMemoryFlowRepository();
  const flow = new FlowService(flowRepo, bus, policy, runtime, governance);
  const evalRepo = new InMemoryEvalRepository();
  const evals = new EvalService(evalRepo, bus, x);
  const observatory = new ObservatoryService(telemetry, aiCalls, runtimeRepo, flowRepo);
  const connectRepo = new InMemoryConnectorRepository();
  const connect = new ConnectService(connectRepo, bus, policy);
  const insightRepo = new InMemoryInsightRepository();
  const hub = new IntelligenceHub(insightRepo, bus, world, runtimeRepo, knowledgeRepo, aiCalls, x);
  const simRepo = new InMemorySimulationRepository();
  const simulator = new SimulatorService(simRepo, bus, flow);
  const notifRepo = new InMemoryNotificationRepository();
  const sphere = new SphereService(notifRepo, bus, world, hub, observatory, mesh, governance, knowledge, memory, runtime);
  const consultingRepo = new InMemoryConsultingRepository();
  const consulting = new ConsultingService(consultingRepo, bus, policy, x, world, flow, knowledge, simulator);
  const devopsRepo = new InMemoryDevOpsRepository();
  const devops = new DevOpsService(devopsRepo, bus, policy);
  const mlopsRepo = new InMemoryMlopsRepository();
  const mlops = new MlopsService(mlopsRepo, bus, policy);
  const secopsRepo = new InMemorySecOpsRepository();
  const secops = new SecOpsService(secopsRepo, bus, policy);
  const aiopsRepo = new InMemoryAiopsRepository();
  const aiops = new AiopsService(aiopsRepo, bus, policy, observatory, guard);
  const agentExecutor = new AgentExecutor({ tools, gateway: x, bus });
  const routerRepo = new InMemoryRouterRepository();
  const router = new ModelRouter(routerRepo, bus, x);
  const compilerRepo = new InMemoryCompilerRepository();
  const compiler = new CompilerService(compilerRepo, bus, policy, x, flow);
  const swarmRepo = new InMemorySwarmRepository();
  const swarm = new SwarmService(swarmRepo, bus, policy, x, runtime);
  const actionsRepo = new InMemoryActionsRepository();
  const actions = new ActionsService(actionsRepo, bus, policy, flow);

  if (snapshots) {
    snapshots.register("runtime", comboSnapshot({ executions: mapSnapshot(runtimeRepo.executions), steps: mapSnapshot(runtimeRepo.stepRows), artifacts: arraySnapshot(runtimeRepo.artifactRows) }));
    snapshots.register("memory", mapSnapshot(memoryRepo.records));
    snapshots.register("knowledge", comboSnapshot({ docs: mapSnapshot(knowledgeRepo.docs), chunks: arraySnapshot(knowledgeRepo.chunks), entities: mapSnapshot(knowledgeRepo.entities), rels: arraySnapshot(knowledgeRepo.rels) }));
    snapshots.register("mesh", mapSnapshot(meshRepo.agents));
    snapshots.register("flow", comboSnapshot({ workflows: mapSnapshot(flowRepo.workflows), runs: mapSnapshot(flowRepo.runs) }));
    snapshots.register("approvals", mapSnapshot(approvalsRepo.rows));
    snapshots.register("registries", mapSnapshot(registryRepo.rows));
    snapshots.register("ontology", comboSnapshot({ nodes: mapSnapshot(ontologyRepo.nodes), edges: arraySnapshot(ontologyRepo.edges) }));
    snapshots.register("web3_contracts", mapSnapshot(web3Repo.rows));
    snapshots.register("guard", arraySnapshot(guardRepo.rows));
    snapshots.register("evals", arraySnapshot(evalRepo.runs));
    snapshots.register("ai_calls", arraySnapshot(aiCalls.records));
    snapshots.register("world", mapSnapshot(worldRepo.entities));
    snapshots.register("insights", arraySnapshot(insightRepo.rows));
    snapshots.register("simulations", arraySnapshot(simRepo.rows));
    snapshots.register("notifications", arraySnapshot(notifRepo.rows));
    snapshots.register("connectors", mapSnapshot(connectRepo.rows));
    snapshots.register("consulting", comboSnapshot({ engagements: mapSnapshot(consultingRepo.engagements), assessments: mapSnapshot(consultingRepo.assessments), roadmaps: mapSnapshot(consultingRepo.roadmaps) }));
    snapshots.register("devops", comboSnapshot({ runs: mapSnapshot(devopsRepo.runs), environments: mapSnapshot(devopsRepo.environments), deployments: mapSnapshot(devopsRepo.deployments) }));
    snapshots.register("mlops", comboSnapshot({ experiments: mapSnapshot(mlopsRepo.experiments), modelVersions: mapSnapshot(mlopsRepo.modelVersions), features: mapSnapshot(mlopsRepo.features), endpoints: mapSnapshot(mlopsRepo.endpoints), drift: arraySnapshot(mlopsRepo.driftReports) }));
    snapshots.register("secops", comboSnapshot({ scans: arraySnapshot(secopsRepo.scans), sboms: arraySnapshot(secopsRepo.sboms), signatures: arraySnapshot(secopsRepo.signatures), policyEvals: arraySnapshot(secopsRepo.policyEvals), redTeam: arraySnapshot(secopsRepo.redTeamRuns) }));
    snapshots.register("aiops", comboSnapshot({ anomalies: arraySnapshot(aiopsRepo.anomalies), incidents: mapSnapshot(aiopsRepo.incidents) }));
    snapshots.register("router", arraySnapshot(routerRepo.decisions));
    snapshots.register("compiler", arraySnapshot(compilerRepo.programs));
    snapshots.register("swarm", mapSnapshot(swarmRepo.runs));
    snapshots.register("actions", arraySnapshot(actionsRepo.rows));
    await snapshots.start();
  }

  if (opts.startScheduler) scheduler.start();

  // Ensure the local AgentOS peer is present in the mesh directory.
  void (async () => {
    try {
      const ctx = systemContext();
      const agents = await meshRepo.list("system");
      if (!agents.some(a => a.kind === "external")) {
        await mesh.register({ ...ctx, principal: { ...ctx.principal } }, {
          name: "AgentOS (python)", kind: "external",
          capabilities: ["identity", "registry", "runtime", "planner", "memory", "tools", "governance"],
          endpoint: config.AGENTOS_URL, metadata: { bridge: "agentos" },
        });
      }
    } catch { /* best effort */ }
  })();

  return {
    config, logger, telemetry, bus, policy, identity, audit, flags, db, snapshots,
    x, moe: new MixtureOfExperts(x), world, memory, knowledge, guard, runtime, scheduler, tools,
    contextEngine, mesh, flow, governance, registries, ethics, ontology, web3, evals, observatory, connect, hub, simulator, sphere, consulting,
    devops, mlops, secops, aiops, agentExecutor, router, compiler, swarm, actions,
    async shutdown() {
      scheduler.stop();
      await snapshots?.stop();
      await bus.close();
      await db?.destroy();
    },
  };
}
