import React, { useState, useMemo, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { AvatarCategory, avatarService } from '../../services/avatarService';
import { AvatarCategoryTabs } from './AvatarCategoryTabs';
import { AvatarGrid } from './AvatarGrid';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentAvatar?: string;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentAvatar 
}) => {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory | 'custom'>('professional');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatars = useMemo(() => {
    if (activeCategory === 'custom') return [];
    return avatarService.getAvatarsByCategory(activeCategory);
  }, [activeCategory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Personalize Your Identity</h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">Select from our vetted collections or upload your own</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <AvatarCategoryTabs 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 focus:outline-none">
          {activeCategory === 'custom' ? (
            <div className="h-full flex flex-col items-center justify-center py-12 space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group shadow-inner"
              >
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                  <RefreshCw size={28} className="text-zinc-500 group-hover:text-indigo-600" />
                </div>
                <span className="mt-3 text-xs font-bold text-zinc-500 group-hover:text-indigo-600">Click to upload</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
              <div className="text-center space-y-1">
                 <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Choose a file</p>
                 <p className="text-[11px] text-zinc-400 max-w-[240px]">
                    JPG, PNG or SVG. Recommended size 512x512px.
                 </p>
              </div>
            </div>
          ) : (
            <AvatarGrid 
              avatars={avatars} 
              currentAvatar={currentAvatar} 
              onSelect={onSelect} 
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex justify-center items-center gap-2">
           <span className="text-[10px] text-zinc-400 font-medium italic">Powered by DiceBear Avatars API</span>
           <div className="w-1 h-1 rounded-full bg-zinc-300" />
           <span className="text-[10px] text-zinc-400 font-medium">Over 200+ unique variations</span>
        </div>
      </motion.div>
    </div>
  );
};
