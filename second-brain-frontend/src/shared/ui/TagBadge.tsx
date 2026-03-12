import type { MouseEventHandler } from 'react';
import { cn } from '@/shared/utils/cn';

interface TagBadgeProps {
  name: string;
  color: string;
  count?: number;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const TagBadge = ({ name, color, count, active = false, onClick, className }: TagBadgeProps) => {
  const isTailwindColor = color.includes('bg-');

  const dotStyle = isTailwindColor ? undefined : { backgroundColor: color };
  const pillStyle = isTailwindColor ? undefined : { borderColor: `${color}40` };
  const textStyle = isTailwindColor ? undefined : { color };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
        'bg-white/80 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800',
        active && 'border-indigo-500/70 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200',
        !onClick && 'cursor-default',
        className,
      )}
      style={pillStyle}
    >
      {isTailwindColor ? (
        <span className={cn('h-3 w-3 rounded-full', color)} />
      ) : (
        <span className="h-3 w-3 rounded-full" style={dotStyle} />
      )}
      <span className="truncate" style={textStyle}>
        {name}
      </span>
      {typeof count === 'number' && (
        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{count}</span>
      )}
    </button>
  );
};

