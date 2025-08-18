// Performance optimization service
class PerformanceService {
  private static instance: PerformanceService;
  private imageCache = new Map<string, HTMLImageElement>();
  private componentCache = new Map<string, any>();
  private apiCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.initializePerformanceMonitoring();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', entry.startTime);
            }
            if (entry.entryType === 'first-input') {
              console.log('FID:', entry.processingStart - entry.startTime);
            }
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        console.warn('Performance monitoring not supported');
      }
    }
  }

  // Preload critical images
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Preload critical components
  preloadComponent(componentPath: string): Promise<any> {
    if (this.componentCache.has(componentPath)) {
      return Promise.resolve(this.componentCache.get(componentPath));
    }

    return import(componentPath).then(component => {
      this.componentCache.set(componentPath, component);
      return component;
    });
  }

  // Cache API responses
  cacheApiResponse(key: string, data: any): void {
    this.apiCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Get cached API response
  getCachedApiResponse(key: string): any | null {
    const cached = this.apiCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.apiCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.apiCache.delete(key);
      }
    }
  }

  // Preload critical resources
  preloadCriticalResources(): void {
    // Preload critical images
    const criticalImages = [
      '/smartq-launchpad-logo.svg',
      '/favicon.svg',
      '/manifest.json'
    ];

    criticalImages.forEach(src => {
      this.preloadImage(src).catch(console.warn);
    });

    // Preload critical components
    const criticalComponents = [
      './components/Layout',
      './components/Header',
      './components/ui/loader'
    ];

    criticalComponents.forEach(component => {
      this.preloadComponent(component).catch(console.warn);
    });
  }

  // Optimize bundle loading
  optimizeBundleLoading(): void {
    // Use Intersection Observer to lazy load non-critical components
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const componentPath = target.dataset.component;
            if (componentPath) {
              this.preloadComponent(componentPath).catch(console.warn);
              observer.unobserve(target);
            }
          }
        });
      });

      // Observe elements with data-component attribute
      document.querySelectorAll('[data-component]').forEach(el => {
        observer.observe(el);
      });
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): Record<string, number> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return {};

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart
    };
  }

  // Optimize memory usage
  optimizeMemory(): void {
    // Clear expired cache entries
    this.clearExpiredCache();
    
    // Clear image cache if memory pressure is high
    if (this.imageCache.size > 50) {
      this.imageCache.clear();
    }
  }
}

export const performanceService = PerformanceService.getInstance();
export default PerformanceService;
