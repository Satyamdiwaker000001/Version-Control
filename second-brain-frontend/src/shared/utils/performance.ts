// Performance optimization utilities

// Debounce function for search and other expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events and other frequent events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoize expensive computations
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Lazy load images
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '50px' }
  );
  
  img.classList.add('lazy');
  observer.observe(img);
}

// Virtual scrolling helper for large lists
export function getVisibleItems<T>(
  items: T[],
  scrollTop: number,
  itemHeight: number,
  containerHeight: number
): { visible: T[]; startIndex: number; endIndex: number } {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  return {
    visible: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
      
      // Keep only last 10 measurements
      const measurements = this.metrics.get(name)!;
      if (measurements.length > 10) {
        measurements.shift();
      }
      
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    };
  }
  
  getAverageTime(name: string): number {
    const measurements = this.metrics.get(name) || [];
    if (measurements.length === 0) return 0;
    return measurements.reduce((a, b) => a + b, 0) / measurements.length;
  }
  
  getReport(): Record<string, { avg: number; min: number; max: number }> {
    const report: Record<string, { avg: number; min: number; max: number }> = {};
    
    for (const [name, measurements] of this.metrics.entries()) {
      if (measurements.length > 0) {
        report[name] = {
          avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
          min: Math.min(...measurements),
          max: Math.max(...measurements),
        };
      }
    }
    
    return report;
  }
}

// Resource loading optimization
export function preloadResource(url: string, type: 'image' | 'script' | 'style'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
    }
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload ${url}`));
    
    document.head.appendChild(link);
  });
}

// Bundle size monitoring
export function logBundleSize() {
  if ('performance' in window && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('📊 Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
    });
  }
}

// Error boundary for better error handling
export class ErrorBoundary {
  static log(error: Error, errorInfo?: any) {
    console.error('🚨 Application Error:', error, errorInfo);
    
    // In production, you'd send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }
}
