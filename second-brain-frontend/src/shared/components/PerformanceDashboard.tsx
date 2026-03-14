import { useState, useEffect } from 'react';
import { PerformanceMonitor, logBundleSize } from '@/shared/utils/performance';
import { Activity, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const monitor = PerformanceMonitor.getInstance();
      
      const updateMetrics = () => {
        setMetrics(monitor.getReport());
      };

      const interval = setInterval(updateMetrics, 1000);
      updateMetrics();

      return () => clearInterval(interval);
    }
  }, []);

  if (!import.meta.env.DEV || !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-[1000] px-3 py-2 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-700"
      >
        📊 Perf
      </button>
    );
  }

  const getMetricColor = (value: number, type: 'time' | 'size') => {
    if (type === 'time') {
      if (value < 50) return 'text-green-500';
      if (value < 100) return 'text-yellow-500';
      return 'text-red-500';
    } else {
      if (value < 1) return 'text-green-500';
      if (value < 5) return 'text-yellow-500';
      return 'text-red-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1000] w-96 bg-gray-900 text-white p-4 rounded-lg shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Activity size={16} />
          Performance Dashboard
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(metrics).map(([name, data]: [string, any]) => (
          <div key={name} className="bg-gray-800 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{name}</span>
              <div className="flex items-center gap-1">
                {data.avg < 50 && <CheckCircle size={12} className="text-green-500" />}
                {data.avg >= 50 && data.avg < 100 && <AlertTriangle size={12} className="text-yellow-500" />}
                {data.avg >= 100 && <Zap size={12} className="text-red-500" />}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-400">Avg</div>
                <div className={getMetricColor(data.avg, 'time')}>
                  {data.avg.toFixed(2)}ms
                </div>
              </div>
              <div>
                <div className="text-gray-400">Min</div>
                <div className="text-blue-400">{data.min.toFixed(2)}ms</div>
              </div>
              <div>
                <div className="text-gray-400">Max</div>
                <div className="text-orange-400">{data.max.toFixed(2)}ms</div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-gray-800 p-3 rounded">
          <button
            onClick={logBundleSize}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            Check Memory Usage
          </button>
        </div>

        <div className="text-xs text-gray-400 text-center">
          Development Mode Only
        </div>
      </div>
    </div>
  );
};
