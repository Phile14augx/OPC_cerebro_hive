import { connect, NatsConnection, StringCodec, JetStreamClient } from 'nats';
import { EventDefinition } from '@cerebro/contracts';

/**
 * CerebroHive EventBus wrapping NATS JetStream.
 * Emits and subscribes to platform-wide events with durability.
 */
export class EventBus {
  private nc: NatsConnection | null = null;
  private js: JetStreamClient | null = null;
  private sc = StringCodec();

  /**
   * Connect to the NATS server.
   */
  async connect(servers: string | string[]): Promise<void> {
    this.nc = await connect({ servers });
    this.js = this.nc.jetstream();
  }

  /**
   * Publish an event to a specific stream/subject.
   * @param subject The routing subject (e.g., 'agent.started', 'node.completed')
   * @param event The canonical EventDefinition object
   */
  async publish(subject: string, event: EventDefinition): Promise<void> {
    if (!this.js) {
      throw new Error('EventBus is not connected to NATS');
    }
    const payload = this.sc.encode(JSON.stringify(event));
    await this.js.publish(subject, payload);
  }

  /**
   * Close the connection.
   */
  async disconnect(): Promise<void> {
    if (this.nc) {
      await this.nc.close();
      this.nc = null;
      this.js = null;
    }
  }
}
