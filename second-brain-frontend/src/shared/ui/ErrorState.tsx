import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface ErrorStateProps {
  title: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  fullPage?: boolean;
  className?: string;
  icon?: ReactNode;
}

const getErrorMessage = (description?: string, error?: unknown) => {
  if (description) return description;
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return null;
};

export const ErrorState = ({
  title,
  description,
  error,
  onRetry,
  retryLabel = 'Try again',
  fullPage = false,
  className,
  icon,
}: ErrorStateProps) => {
  const message = getErrorMessage(description, error);

  const content = (
    <div
      className={cn(
        'max-w-md w-full space-y-4 bg-white/95 dark:bg-zinc-900/95 border border-red-100 dark:border-red-900/40 rounded-xl p-6 shadow-sm',
        className,
      )}
    >
      <div className="w-14 h-14 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
        {icon ?? <AlertCircle size={28} />}
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          {title}
        </h2>
        {message && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 break-words">
            {message}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-zinc-950 p-6">
        {content}
      </div>
    );
  }

  return content;
};

