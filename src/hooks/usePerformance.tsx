import { useEffect, useCallback, useRef } from 'react';
import { performanceService } from '@/services/performanceService';

export const usePerformance = () => {
  const performanceRef = useRef<{
    startTime: number;
    metrics: Record<string, number>;
  }>({
    startTime: Date.now(),
    metrics: {}
  });

  // Monitor component render performance
  const measureRender = useCallback((componentName: string) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (duration > 16) { // Longer than one frame (16.67ms)
        console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
      
      performanceRef.current.metrics[`${componentName}_render`] = duration;
    };
  }, []);

  // Monitor API call performance
  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      
      if (duration > 1000) { // Longer than 1 second
        console.warn(`Slow API call detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      performanceRef.current.metrics[`${operationName}_api`] = duration;
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      performanceRef.current.metrics[`${operationName}_api_error`] = duration;
      throw error;
    }
  }, []);

  // Monitor memory usage
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      
      if (usedMB > 100) { // More than 100MB
        console.warn(`High memory usage: ${usedMB}MB / ${totalMB}MB`);
        performanceService.optimizeMemory();
      }
    }
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const totalTime = Date.now() - performanceRef.current.startTime;
    const metrics = performanceRef.current.metrics;
    
    return {
      totalTime,
      metrics,
      averageRenderTime: Object.values(metrics)
        .filter(key => key.toString().includes('render'))
        .reduce((sum, time) => sum + time, 0) / 
        Object.keys(metrics).filter(key => key.includes('render')).length || 0,
      averageApiTime: Object.values(metrics)
        .filter(key => key.toString().includes('api'))
        .reduce((sum, time) => sum + time, 0) / 
        Object.keys(metrics).filter(key => key.includes('api')).length || 0
    };
  }, []);

  // Optimize images
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
      
      if (!img.decoding) {
        img.decoding = 'async';
      }
    });
  }, []);

  // Optimize scroll performance
  const optimizeScroll = useCallback(() => {
    const scrollElements = document.querySelectorAll('.scroll-container, [data-scroll]');
    scrollElements.forEach(element => {
      (element as HTMLElement).style.willChange = 'transform';
      (element as HTMLElement).style.transform = 'translateZ(0)';
    });
  }, []);

  useEffect(() => {
    // Initialize performance monitoring
    const memoryInterval = setInterval(monitorMemory, 30000); // Every 30 seconds
    
    // Optimize on mount
    optimizeImages();
    optimizeScroll();
    
    // Preload critical resources
    performanceService.preloadCriticalResources();
    
    return () => {
      clearInterval(memoryInterval);
      
      // Log performance summary on unmount
      const summary = getPerformanceSummary();
      console.log('Performance Summary:', summary);
    };
  }, [monitorMemory, optimizeImages, optimizeScroll, getPerformanceSummary]);

  return {
    measureRender,
    measureApiCall,
    getPerformanceSummary,
    optimizeImages,
    optimizeScroll,
    monitorMemory
  };
};

export default usePerformance;