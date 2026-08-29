import { Injectable } from '@nestjs/common';
import type { IConnector } from './connectors/connector.interface';

export type ConnectorFactory = (config: Record<string, unknown>) => IConnector;
export interface ConnectorRequest { id: string; type: string; config?: Record<string, unknown> }
export interface RegisteredConnector { id: string; type: string; connector: IConnector }

@Injectable()
export class IngestionService {
  private readonly factories = new Map<string, ConnectorFactory>();
  private readonly connectors = new Map<string, RegisteredConnector>();

  registerConnectorFactory(type: string, factory: ConnectorFactory): void {
    if (!type.trim()) throw new Error('Connector type is required');
    if (typeof factory !== 'function') throw new Error('Connector factory is required');
    if (this.factories.has(type)) throw new Error(`Connector type "${type}" is already registered`);
    this.factories.set(type, factory);
  }

  createConnector(data: ConnectorRequest): RegisteredConnector {
    if (!data?.id?.trim()) throw new Error('Connector id is required');
    if (!data?.type?.trim()) throw new Error('Connector type is required');
    if (this.connectors.has(data.id)) throw new Error(`Connector "${data.id}" already exists`);
    const factory = this.factories.get(data.type);
    if (!factory) throw new Error(`Unknown connector type "${data.type}"`);
    const registered = { id: data.id, type: data.type, connector: factory(data.config ?? {}) };
    this.connectors.set(data.id, registered);
    return registered;
  }
}
