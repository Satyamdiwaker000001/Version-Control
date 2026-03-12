import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/30 p-10 text-center',
        className,
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

