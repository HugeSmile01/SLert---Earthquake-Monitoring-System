class ErrorTrackingService {
  private sentryEnabled: boolean = false;

  init(): void {
    try {
      const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
      
      if (sentryDsn && sentryDsn !== 'YOUR_SENTRY_DSN') {
        try {
          if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Sentry) {
            const Sentry = (window as unknown as Record<string, unknown>).Sentry as Record<string, unknown>;
            if (typeof Sentry.init === 'function') {
              (Sentry.init as (config: unknown) => void)({
                dsn: sentryDsn,
                integrations: [
                  typeof Sentry.browserTracingIntegration === 'function' ? (Sentry.browserTracingIntegration as () => unknown)() : null,
                  typeof Sentry.replayIntegration === 'function' ? (Sentry.replayIntegration as () => unknown)() : null,
                ].filter(Boolean),
                tracesSampleRate: 1.0,
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1.0,
                environment: import.meta.env.MODE || 'development',
              });
              this.sentryEnabled = true;
              console.log('✅ Sentry error tracking initialized');
            } else {
              throw new Error('Sentry init not found');
            }
          } else {
            console.warn('⚠️ Sentry SDK not loaded. Add Sentry script to index.html');
            this.setupFallbackErrorTracking();
          }
        } catch (sentryError) {
          console.error('❌ Error initializing Sentry:', sentryError);
          this.setupFallbackErrorTracking();
        }
      } else {
        console.log('ℹ️ Sentry DSN not configured. Using fallback error tracking.');
        this.setupFallbackErrorTracking();
      }
    } catch (error) {
      console.error('Critical error in error tracking initialization:', error);
      this.setupFallbackErrorTracking();
    }
  }

  private setupFallbackErrorTracking(): void {
    try {
      if (typeof window === 'undefined') {
        console.error('Window object not available');
        return;
      }

      window.addEventListener('error', (event) => {
        try {
          this.logError(event.error || new Error(event.message || 'Unknown error'), {
            type: 'unhandled_error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          });
        } catch (error) {
          console.error('Error in error handler:', error);
        }
      });

      window.addEventListener('unhandledrejection', (event) => {
        try {
          const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason || 'Unknown rejection'));
          this.logError(reason, {
            type: 'unhandled_promise_rejection',
          });
        } catch (error) {
          console.error('Error in unhandled rejection handler:', error);
        }
      });
    } catch (error) {
      console.error('Failed to setup fallback error tracking:', error);
    }
  }

  private logError(error: Error, context?: Record<string, unknown>): void {
    try {
      if (!error) {
        console.error('Attempted to log null/undefined error');
        return;
      }

      const errorLog = {
        message: error.message || 'Unknown error',
        stack: error.stack || 'No stack trace',
        context: context || {},
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      };

      console.error('🚨 Error logged:', errorLog);

      try {
        if (typeof localStorage === 'undefined') {
          return;
        }

        let errors: unknown[] = [];
        try {
          const storedErrors = localStorage.getItem('error_logs');
          errors = storedErrors ? JSON.parse(storedErrors) : [];
          if (!Array.isArray(errors)) {
            errors = [];
          }
        } catch (parseError) {
          console.error('Failed to parse stored errors:', parseError);
          errors = [];
        }

        errors.unshift(errorLog);
        localStorage.setItem('error_logs', JSON.stringify(errors.slice(0, 10)));
      } catch (storageError) {
        console.error('Failed to store error log:', storageError);
      }
    } catch (error) {
      console.error('Critical error in logError:', error);
    }
  }

  captureException(error: Error, context?: Record<string, unknown>): void {
    try {
      if (!error) {
        console.error('Attempted to capture null/undefined error');
        return;
      }

      if (this.sentryEnabled && typeof window !== 'undefined') {
        const Sentry = (window as unknown as Record<string, unknown>).Sentry as Record<string, unknown> | undefined;
        if (Sentry && typeof Sentry.captureException === 'function') {
          (Sentry.captureException as (error: Error, options?: unknown) => void)(error, { extra: context });
          return;
        }
      }
      this.logError(error, context);
    } catch (captureError) {
      console.error('Error capturing exception:', captureError);
      this.logError(error, context);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    try {
      if (!message || typeof message !== 'string') {
        console.error('Invalid message provided');
        return;
      }

      if (this.sentryEnabled && typeof window !== 'undefined') {
        const Sentry = (window as unknown as Record<string, unknown>).Sentry as Record<string, unknown> | undefined;
        if (Sentry && typeof Sentry.captureMessage === 'function') {
          (Sentry.captureMessage as (msg: string, lvl?: string) => void)(message, level);
          return;
        }
      }
      console.log(`[${level.toUpperCase()}] ${message}`);
    } catch (error) {
      console.error('Error capturing message:', error);
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }

  setUser(userId: string, email?: string): void {
    try {
      if (!userId) {
        console.error('Invalid user ID');
        return;
      }

      if (this.sentryEnabled && typeof window !== 'undefined') {
        const Sentry = (window as unknown as Record<string, unknown>).Sentry as Record<string, unknown> | undefined;
        if (Sentry && typeof Sentry.setUser === 'function') {
          (Sentry.setUser as (user: { id: string; email?: string }) => void)({ id: userId, email });
        }
      }
    } catch (error) {
      console.error('Error setting user context:', error);
    }
  }

  getErrorLogs(): unknown[] {
    try {
      if (typeof localStorage === 'undefined') {
        return [];
      }

      const logs = localStorage.getItem('error_logs');
      if (!logs) {
        return [];
      }

      const parsed = JSON.parse(logs);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error retrieving error logs:', error);
      return [];
    }
  }

  clearErrorLogs(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('error_logs');
      }
    } catch (error) {
      console.error('Error clearing error logs:', error);
    }
  }
}

export const errorTrackingService = new ErrorTrackingService();
