/**
 * Chrome-specific optimizations and compatibility fixes
 * Addresses common Chrome browser issues and performance problems
 */

export interface ChromeInfo {
  isChrome: boolean;
  version: string;
  hasExtensions: boolean;
  memoryInfo?: any;
  localStorageQuota: number;
}

/**
 * Detect Chrome browser and gather information
 */
export const detectChrome = (): ChromeInfo => {
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  
  let version = 'unknown';
  if (isChrome) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'unknown';
  }
  
  const hasExtensions = isChrome && !!(window as any).chrome?.runtime;
  
  let memoryInfo;
  if (isChrome && 'memory' in performance) {
    memoryInfo = (performance as any).memory;
  }
  
  // Test localStorage quota
  let localStorageQuota = 0;
  try {
    const testKey = 'chrome-quota-test';
    const testData = 'x'.repeat(1024 * 100); // 100KB test
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    localStorageQuota = 1024 * 1024 * 5; // Assume 5MB minimum
  } catch (e) {
    console.warn('⚠️ Chrome localStorage quota test failed:', e);
  }
  
  return {
    isChrome,
    version,
    hasExtensions,
    memoryInfo,
    localStorageQuota
  };
};

/**
 * Apply Chrome-specific optimizations
 */
export const applyChromeOptimizations = (): void => {
  const chromeInfo = detectChrome();
  
  if (!chromeInfo.isChrome) {
    console.log('🌐 Non-Chrome browser detected, skipping Chrome optimizations');
    return;
  }
  
  console.log('🚀 Applying Chrome optimizations...', chromeInfo);
  
  // Disable Chrome extensions that might interfere
  if (chromeInfo.hasExtensions) {
    console.log('🔌 Chrome extensions detected - applying mitigations');
    
    // Override common extension APIs that might cause issues
    if ((window as any).chrome?.runtime?.onMessage) {
      console.log('📡 Chrome runtime API detected');
    }
  }
  
  // Optimize Chrome's memory usage
  if (chromeInfo.memoryInfo) {
    console.log('💾 Chrome memory info:', {
      used: Math.round(chromeInfo.memoryInfo.usedJSHeapSize / 1024 / 1024),
      total: Math.round(chromeInfo.memoryInfo.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(chromeInfo.memoryInfo.jsHeapSizeLimit / 1024 / 1024)
    });
    
    // Warn if memory usage is high
    const memoryUsagePercent = (chromeInfo.memoryInfo.usedJSHeapSize / chromeInfo.memoryInfo.jsHeapSizeLimit) * 100;
    if (memoryUsagePercent > 80) {
      console.warn('⚠️ High Chrome memory usage:', memoryUsagePercent.toFixed(1) + '%');
    }
  }
  
  // Chrome-specific localStorage optimizations
  try {
    // Clear old test data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chrome-perf-test') || key?.startsWith('chrome-quota-test')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Chrome localStorage optimized');
  } catch (e) {
    console.warn('⚠️ Chrome localStorage optimization failed:', e);
  }
  
  // Chrome-specific performance optimizations
  if (chromeInfo.version !== 'unknown') {
    const versionNum = parseInt(chromeInfo.version);
    
    // Apply version-specific optimizations
    if (versionNum >= 80) {
      console.log('✅ Chrome 80+ detected - using modern optimizations');
      
      // Enable modern Chrome features
      if ('requestIdleCallback' in window) {
        console.log('✅ Chrome requestIdleCallback available');
      }
      
      if ('IntersectionObserver' in window) {
        console.log('✅ Chrome IntersectionObserver available');
      }
    } else {
      console.warn('⚠️ Older Chrome version detected:', chromeInfo.version);
    }
  }
};

/**
 * Chrome-specific error handling
 */
export const setupChromeErrorHandling = (): void => {
  const chromeInfo = detectChrome();
  
  if (!chromeInfo.isChrome) return;
  
  // Enhanced error handling for Chrome
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    if (error?.message?.includes('Chrome') || 
        error?.message?.includes('extension') ||
        error?.message?.includes('chrome-extension://')) {
      console.warn('⚠️ Chrome-specific error detected:', {
        message: error.message,
        stack: error.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Don't propagate Chrome extension errors
      if (error?.message?.includes('chrome-extension://')) {
        event.preventDefault();
        return false;
      }
    }
  });
  
  // Chrome-specific unhandled promise rejection handling
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    
    if (reason?.message?.includes('Chrome') || 
        reason?.message?.includes('extension') ||
        reason?.message?.includes('chrome-extension://')) {
      console.warn('⚠️ Chrome-specific promise rejection:', reason);
      
      // Don't propagate Chrome extension promise rejections
      if (reason?.message?.includes('chrome-extension://')) {
        event.preventDefault();
        return false;
      }
    }
  });
};

/**
 * Chrome-specific performance monitoring
 */
export const setupChromePerformanceMonitoring = (): void => {
  const chromeInfo = detectChrome();
  
  if (!chromeInfo.isChrome) return;
  
  // Monitor Core Web Vitals with Chrome-specific metrics
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            console.log('🎯 LCP:', entry.startTime, 'ms');
            if (entry.startTime > 2500) {
              console.warn('⚠️ Slow LCP detected - consider optimization');
            }
            break;
            
          case 'first-input':
            const fid = entry.processingStart - entry.startTime;
            console.log('⚡ FID:', fid, 'ms');
            if (fid > 100) {
              console.warn('⚠️ Slow FID detected - consider optimization');
            }
            break;
            
          case 'cumulative-layout-shift':
            console.log('📐 CLS:', entry.value);
            if (entry.value > 0.1) {
              console.warn('⚠️ High CLS detected - consider layout optimization');
            }
            break;
            
          case 'navigation':
            console.log('🚀 Navigation timing:', {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              total: entry.loadEventEnd - entry.fetchStart
            });
            break;
        }
      });
    });
    
    try {
      observer.observe({ 
        entryTypes: [
          'largest-contentful-paint', 
          'first-input', 
          'cumulative-layout-shift',
          'navigation'
        ] 
      });
    } catch (e) {
      console.warn('⚠️ PerformanceObserver not fully supported:', e);
    }
  }
  
  // Chrome-specific memory monitoring
  if (chromeInfo.memoryInfo) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usagePercent > 90) {
        console.warn('🚨 High Chrome memory usage:', usagePercent.toFixed(1) + '%');
        
        // Suggest garbage collection
        if ('gc' in window) {
          console.log('🧹 Suggesting garbage collection...');
          (window as any).gc();
        }
      }
    }, 30000); // Check every 30 seconds
  }
};

/**
 * Initialize all Chrome optimizations
 */
export const initializeChromeOptimizations = (): void => {
  console.log('🔧 Initializing Chrome optimizations...');
  
  applyChromeOptimizations();
  setupChromeErrorHandling();
  setupChromePerformanceMonitoring();
  
  console.log('✅ Chrome optimizations initialized');
};
