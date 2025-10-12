/**
 * Error tracking service using Sentry.io
 * Note: Sentry SDK should be added via CDN or npm for full functionality
 * This is a wrapper to initialize and use Sentry when available
 */
class ErrorTrackingService {
  private sentryEnabled: boolean = false;

  /**
   * Initialize Sentry if DSN is provided
   */
  init(): void {
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (sentryDsn && sentryDsn !== 'YOUR_SENTRY_DSN') {
      try {
        // Check if Sentry is loaded (via CDN)
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.init({
            dsn: sentryDsn,
            integrations: [
              (window as any).Sentry.browserTracingIntegration(),
              (window as any).Sentry.replayIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0,
            // Session Replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            environment: import.meta.env.MODE || 'development',
          });
          this.sentryEnabled = true;
          console.log('✅ Sentry error tracking initialized');
        } else {
          console.warn('⚠️ Sentry SDK not loaded. Add Sentry script to index.html');
          this.setupFallbackErrorTracking();
        }
      } catch (error) {
        console.error('❌ Error initializing Sentry:', error);
        this.setupFallbackErrorTracking();
      }
    } else {
      console.log('ℹ️ Sentry DSN not configured. Using fallback error tracking.');
      this.setupFallbackErrorTracking();
    }
  }

  /**
   * Setup fallback error tracking using console and local storage
   */
  private setupFallbackErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
      });
    });
  }

  /**
   * Log error to Sentry or fallback storage
   */
  private logError(error: Error, context?: Record<string, any>): void {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    console.error('🚨 Error logged:', errorLog);

    // Store in localStorage for debugging (keep last 10 errors)
    try {
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.unshift(errorLog);
      localStorage.setItem('error_logs', JSON.stringify(errors.slice(0, 10)));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  /**
   * Capture exception manually
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (this.sentryEnabled && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: context });
    } else {
      this.logError(error, context);
    }
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (this.sentryEnabled && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, level);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Set user context
   */
  setUser(userId: string, email?: string): void {
    if (this.sentryEnabled && (window as any).Sentry) {
      (window as any).Sentry.setUser({ id: userId, email });
    }
  }

  /**
   * Get error logs from localStorage
   */
  getErrorLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear error logs
   */
  clearErrorLogs(): void {
    localStorage.removeItem('error_logs');
  }
}

export const errorTrackingService = new ErrorTrackingService();
