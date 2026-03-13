import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface AvatarCardProps {
  url: string;
  isSelected: boolean;
  onSelect: (url: string) => void;
  index: number;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({ url, isSelected, onSelect, index }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(url)}
      className={cn(
        "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group shadow-sm",
        isSelected 
          ? "border-indigo-500 ring-4 ring-indigo-500/10" 
          : "border-zinc-100 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700"
      )}
    >
      <img 
        src={url} 
        alt={`Avatar ${index}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {isSelected && (
        <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
          <div className="bg-indigo-600 text-white p-1 rounded-full shadow-lg scale-110">
            <Check size={12} strokeWidth={4} />
          </div>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
    </motion.button>
  );
};
