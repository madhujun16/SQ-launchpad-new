import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  timeToFirstByte: number;
  timeToFirstContentfulPaint: number;
  timeToLargestContentfulPaint: number;
  totalBundleSize: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      setIsVisible(true);
      
      const measurePerformance = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const timeToFirstByte = navigation.responseStart - navigation.requestStart;
        const timeToFirstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        const timeToLargestContentfulPaint = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
        
        // Estimate bundle size (this is a rough estimate)
        const totalBundleSize = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
        
        setMetrics({
          timeToFirstByte,
          timeToFirstContentfulPaint,
          timeToLargestContentfulPaint,
          totalBundleSize
        });
      };

      // Measure after a short delay to allow for initial render
      setTimeout(measurePerformance, 1000);
    }
  }, []);

  if (!isVisible || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Performance Metrics</h3>
      <div className="space-y-1">
        <div>TTFB: {metrics.timeToFirstByte.toFixed(2)}ms</div>
        <div>FCP: {metrics.timeToFirstContentfulPaint.toFixed(2)}ms</div>
        <div>LCP: {metrics.timeToLargestContentfulPaint.toFixed(2)}ms</div>
        <div>Memory: {(metrics.totalBundleSize / 1024 / 1024).toFixed(2)}MB</div>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="mt-2 text-xs text-gray-400 hover:text-white"
      >
        Hide
      </button>
    </div>
  );
};

export default PerformanceMonitor; 