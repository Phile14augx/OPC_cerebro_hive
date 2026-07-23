import { BaseWorker } from '@cerebro/events';

interface NotificationPayload {
  userId: string;
  type: 'email' | 'push' | 'in_app';
  subject: string;
  body: string;
}

export class NotificationWorker extends BaseWorker<NotificationPayload> {
  constructor(natsConnection: any) {
    super('notification.send', natsConnection);
  }

  async handle(payload: NotificationPayload, headers?: Record<string, string>): Promise<void> {
    console.log(`[NotificationWorker] Sending ${payload.type} to ${payload.userId}`);
    // Scaffold: Send via SendGrid, Twilio, or Websockets
  }
}
