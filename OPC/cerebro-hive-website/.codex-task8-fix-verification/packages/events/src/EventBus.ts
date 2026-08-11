
import mitt from 'mitt';
import { PlatformEventMap } from './EventTypes';

// Hidden implementation detail
const emitter = mitt<any>();

export class PlatformEventBus {
  static publish<K extends keyof PlatformEventMap>(type: K, event: PlatformEventMap[K]) {
    emitter.emit(type, event);
    // Future middleware hook point for WebSockets/NATS here
  }

  static subscribe<K extends keyof PlatformEventMap>(type: K, handler: (event: PlatformEventMap[K]) => void) {
    emitter.on(type, handler);
    return () => emitter.off(type, handler);
  }
}
