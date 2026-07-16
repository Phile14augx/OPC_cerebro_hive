/**
 * Generic Analytics Adapter
 * Designed to be easily swapped with PostHog, Segment, or Google Analytics
 */

export interface AnalyticsEvent {
  eventName: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

class AnalyticsAdapter {
  private initialized = false;

  init() {
    if (this.initialized) return;
    // Initialization logic for third party analytics (e.g., PostHog.init())
    this.initialized = true;
    console.log('[Analytics] Initialized');
  }

  track(event: AnalyticsEvent) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Track]: ${event.eventName}`, event);
    }
    
    // Example: window.posthog?.capture(event.eventName, event);
    // Example: window.gtag?.('event', event.eventName, event);
  }

  pageView(url: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics PageView]: ${url}`);
    }
    
    // Example: window.posthog?.capture('$pageview');
  }
}

export const analytics = new AnalyticsAdapter();
