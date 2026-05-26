/**
 * Simple analytics tracking utility for user engagement
 */

interface AnalyticsEvent {
  name: string;
  timestamp: number;
  userId?: string;
  properties?: Record<string, unknown>;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private enabled: boolean = true;

  /**
   * Track an event
   */
  trackEvent(
    name: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name,
      timestamp: Date.now(),
      properties,
    };

    this.events.push(event);

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', name, properties);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string): void {
    this.trackEvent('page_view', { page: pageName });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, action: string): void {
    this.trackEvent('feature_used', {
      feature: featureName,
      action,
    });
  }

  /**
   * Track error
   */
  trackError(errorName: string, errorMessage: string): void {
    this.trackEvent('error_occurred', {
      error: errorName,
      message: errorMessage,
    });
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Export type for use in components
export type { AnalyticsEvent };
