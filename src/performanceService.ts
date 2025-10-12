/**
 * Performance monitoring service using Web Vitals API
 */
class PerformanceService {
  private metrics: { [key: string]: number } = {};

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if ('PerformanceObserver' in window) {
      this.observeWebVitals();
      this.observeResourceTiming();
      console.log('✅ Performance monitoring initialized');
    } else {
      console.warn('⚠️ Performance API not supported');
    }
  }

  /**
   * Observe Core Web Vitals (CLS, FID, LCP)
   */
  private observeWebVitals(): void {
    try {
      // Largest Contentful Paint (LCP)
      this.observeMetric('largest-contentful-paint', (entry) => {
        const lcp = entry.renderTime || entry.loadTime;
        this.metrics.lcp = lcp;
        console.log(`📊 LCP: ${lcp.toFixed(2)}ms`);
        this.reportMetric('LCP', lcp);
      });

      // First Input Delay (FID)
      this.observeMetric('first-input', (entry) => {
        const fid = entry.processingStart - entry.startTime;
        this.metrics.fid = fid;
        console.log(`📊 FID: ${fid.toFixed(2)}ms`);
        this.reportMetric('FID', fid);
      });

      // Cumulative Layout Shift (CLS)
      this.observeCLS();

    } catch (error) {
      console.error('Error observing web vitals:', error);
    }
  }

  /**
   * Observe a specific performance metric
   */
  private observeMetric(type: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });
      observer.observe({ type, buffered: true });
    } catch (error) {
      console.warn(`Unable to observe ${type}:`, error);
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS(): void {
    let clsValue = 0;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.cls = clsValue;
            console.log(`📊 CLS: ${clsValue.toFixed(4)}`);
            this.reportMetric('CLS', clsValue);
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('Unable to observe CLS:', error);
    }
  }

  /**
   * Observe resource timing
   */
  private observeResourceTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          if (resource.initiatorType === 'fetch' || resource.initiatorType === 'xmlhttprequest') {
            const duration = resource.responseEnd - resource.requestStart;
            console.log(`📡 API Call: ${resource.name} - ${duration.toFixed(2)}ms`);
          }
        }
      });
      observer.observe({ type: 'resource', buffered: true });
    } catch (error) {
      console.warn('Unable to observe resource timing:', error);
    }
  }

  /**
   * Report metric to console and storage
   */
  private reportMetric(name: string, value: number): void {
    // Store metrics for display
    const metrics = this.getMetrics();
    metrics[name] = value;
    metrics.timestamp = Date.now();
    
    try {
      localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    } catch (e) {
      console.error('Failed to store metrics:', e);
    }
  }

  /**
   * Get stored metrics
   */
  getMetrics(): { [key: string]: number } {
    try {
      const stored = localStorage.getItem('performance_metrics');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Get performance rating for a metric
   */
  getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: { [key: string]: { good: number; poor: number } } = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Measure custom timing
   */
  measureTiming(name: string, startTime: number): void {
    const duration = performance.now() - startTime;
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    this.reportMetric(name, duration);
  }

  /**
   * Get navigation timing
   */
  getNavigationTiming(): PerformanceTiming | null {
    if ('performance' in window && 'timing' in performance) {
      return performance.timing;
    }
    return null;
  }
}

export const performanceService = new PerformanceService();
