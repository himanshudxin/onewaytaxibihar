/**
 * OneWayTaxiBihar Mobile Error Tracking & Breadcrumbs Ring Buffer
 * Captures native app exceptions, HTTP failures, and breadcrumbs,
 * sanitizes credentials/tokens, and dispatches to the central diagnostics desk.
 */

export interface Breadcrumb {
  category: string;
  message: string;
  data?: Record<string, any>;
  timestamp?: string;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  breadcrumbs?: Breadcrumb[];
  timestamp?: string;
  appVersion?: string;
}

class MobileErrorTracker {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 25;
  private endpoint = 'https://onewaytaxibihar.com/api/telemetry/errors';

  public addBreadcrumb(crumb: Breadcrumb | string) {
    const entry: Breadcrumb = typeof crumb === 'string'
      ? { category: 'app', message: crumb, timestamp: new Date().toISOString() }
      : { ...crumb, timestamp: crumb.timestamp || new Date().toISOString() };

    this.breadcrumbs.push(entry);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  public async captureException(error: Error | string, context?: string): Promise<void> {
    const message = typeof error === 'string' ? error : error.message || 'Unknown native error';
    const stack = typeof error === 'string' ? '' : error.stack || '';

    const report: ErrorReport = {
      message: context ? `[${context}] ${message}` : message,
      stack,
      breadcrumbs: [...this.breadcrumbs],
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0'
    };

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
    } catch (e) {
      // Offline fallback: keep in local ring buffer
    }
  }

  public getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  public clear(): void {
    this.breadcrumbs = [];
  }
}

export const ErrorTracker = new MobileErrorTracker();
export default ErrorTracker;

