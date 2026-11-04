/**
 * OneWayTaxiBihar Mobile Analytics & Telemetry Service
 * Tracks user lifecycle events, screen views, booking funnels, and performance metrics.
 * Transmits asynchronously to backend telemetry endpoint /api/telemetry/events.
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  app: 'passenger' | 'driver' | 'admin';
  sessionId?: string;
}

class MobileAnalyticsService {
  private appName: 'passenger' | 'driver' | 'admin' = 'passenger';
  private sessionId: string = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  private eventQueue: AnalyticsEvent[] = [];
  private isFlushing: boolean = false;
  private apiBaseUrl: string = 'https://onewaytaxibihar.com';

  public init(appName: 'passenger' | 'driver' | 'admin', baseUrl?: string) {
    this.appName = appName;
    if (baseUrl) {
      this.apiBaseUrl = baseUrl;
    }
  }

  /**
   * Track custom user lifecycle or operational milestone event
   */
  public async track(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    const eventPayload: AnalyticsEvent = {
      event: eventName,
      properties: {
        ...properties,
        app: this.appName,
        platform: 'mobile_native',
      },
      timestamp: new Date().toISOString(),
      app: this.appName,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(eventPayload);

    // Keep queue bounded
    if (this.eventQueue.length > 50) {
      this.eventQueue.shift();
    }

    await this.flushQueue();
  }

  /**
   * Track mobile screen navigation view
   */
  public async screenView(screenName: string, properties: Record<string, any> = {}): Promise<void> {
    await this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Flushes queued analytics events to the backend telemetry ingestion service
   */
  private async flushQueue(): Promise<void> {
    if (this.isFlushing || this.eventQueue.length === 0) return;
    this.isFlushing = true;

    try {
      const batch = [...this.eventQueue];
      for (const item of batch) {
        try {
          await fetch(`${this.apiBaseUrl}/api/telemetry/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
        } catch {
          // Silent swallow for telemetry network failures
        }
      }
      this.eventQueue = this.eventQueue.slice(batch.length);
    } catch {
      // Ingestion resilience
    } finally {
      this.isFlushing = false;
    }
  }
}

export const analytics = new MobileAnalyticsService();
export default analytics;

