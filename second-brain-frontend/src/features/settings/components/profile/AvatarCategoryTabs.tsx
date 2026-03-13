import React from 'react';
import { cn } from '@/shared/utils/cn';
import { AvatarCategory } from '../../services/avatarService';

interface AvatarCategoryTabsProps {
  activeCategory: AvatarCategory | 'custom';
  onCategoryChange: (category: AvatarCategory | 'custom') => void;
}

const CATEGORIES: { id: AvatarCategory; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'stylish', label: 'Stylish' },
  { id: 'crazy', label: 'Crazy' },
  { id: 'sport-freak', label: 'Sport Freak' },
  { id: 'tech-freak', label: 'Tech Freak' },
];

export const AvatarCategoryTabs: React.FC<AvatarCategoryTabsProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="relative border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar relative z-10 mask-fade-right">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0",
              activeCategory === cat.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105 z-20"
                : "bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
            )}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => onCategoryChange('custom')}
          className={cn(
            "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0",
            activeCategory === 'custom'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105 z-20"
              : "bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
          )}
        >
          Upload Custom
        </button>
      </div>
    </div>
  );
};
