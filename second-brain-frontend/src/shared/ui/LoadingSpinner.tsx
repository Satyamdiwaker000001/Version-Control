import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
  className?: string;
  icon?: ReactNode;
}

export const LoadingSpinner = ({
  label,
  fullPage = false,
  className,
  icon,
}: LoadingSpinnerProps) => {
  const content = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {icon ?? (
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      )}
      {label && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          {label}
        </p>
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

interface LoadingOverlayProps {
  label?: string;
  className?: string;
}

export const LoadingOverlay = ({ label, className }: LoadingOverlayProps) => (
  <div
    className={cn(
      'absolute inset-0 flex items-center justify-center bg-zinc-50/60 dark:bg-zinc-950/60 z-20',
      className,
    )}
  >
    <LoadingSpinner label={label} />
  </div>
);

