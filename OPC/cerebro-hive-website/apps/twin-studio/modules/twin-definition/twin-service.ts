import { CreateTwinCommandSchema, type Scope, TwinDefinitionSchema } from '@cerebro/twin-contracts';
import { factoryTwin } from '../demo-factory/factory-definition';

export type TwinRecord = typeof factoryTwin & { tenantId: string; workspaceId: string; version: number; status: 'LIVE' };
const demo: TwinRecord = { ...factoryTwin, tenantId: 'demo-tenant', workspaceId: 'demo-workspace', version: 1, status: 'LIVE' };
const twins = new Map<string, TwinRecord>([[demo.id, demo]]);

export function listTwins(scope: Scope) { return [...twins.values()].filter(t => t.tenantId === scope.tenantId && t.workspaceId === scope.workspaceId); }
export function getTwin(scope: Scope, id: string) { const twin = twins.get(id); return twin?.tenantId === scope.tenantId && twin.workspaceId === scope.workspaceId ? twin : undefined; }
export function createTwin(input: unknown): TwinRecord { const command = CreateTwinCommandSchema.parse(input); TwinDefinitionSchema.parse(command.definition); const id = `twin-${crypto.randomUUID()}`; const twin: TwinRecord = { id, name: command.name, mode: 'SIMULATED', entities: [], tenantId: command.tenantId, workspaceId: command.workspaceId, version: 1, status: 'LIVE' }; twins.set(id, twin); return twin; }
