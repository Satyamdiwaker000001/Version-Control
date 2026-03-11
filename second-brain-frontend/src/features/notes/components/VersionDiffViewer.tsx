import { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { GitCommit, ArrowLeft, ArrowRight, Expand } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface VersionDiffViewerProps {
  oldCode: string;
  newCode: string;
  oldVersionId: string;
  newVersionId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore?: () => void;
}

export const VersionDiffViewer = ({ 
  oldCode, 
  newCode, 
  oldVersionId, 
  newVersionId,
  isOpen,
  onClose,
  onRestore
}: VersionDiffViewerProps) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const [splitView, setSplitView] = useState(true);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid max-w-[90vw] w-full max-h-[90vh] h-full translate-x-[-50%] translate-y-[-50%] p-0 flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl overflow-hidden focus:outline-none">
          
          {/* Diff Toolbar */}
          <div className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <GitCommit size={18} className="text-indigo-500" />
                Version Comparison
              </h2>
              <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500 font-mono bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-md">
                <span className="text-red-500 dark:text-red-400 font-bold">{oldVersionId}</span>
                <ArrowRight size={14} className="mx-1" />
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">{newVersionId}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setSplitView(!splitView)}
                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
               >
                 <Expand size={14} /> {splitView ? 'Unified View' : 'Split View'}
               </button>
               {onRestore && (
                 <button 
                   onClick={onRestore}
                   className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                 >
                   <ArrowLeft size={14} /> Restore {oldVersionId}
                 </button>
               )}
            </div>
          </div>

          {/* Diff Canvas */}
          <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950 p-4">
            <ReactDiffViewer
              oldValue={oldCode}
              newValue={newCode}
              splitView={splitView}
              useDarkTheme={isDarkMode}
              leftTitle={`Version ${oldVersionId}`}
              rightTitle={`Version ${newVersionId} (Current)`}
              styles={{
                variables: {
                  dark: {
                    diffViewerBackground: '#09090b',
                    diffViewerTitleBackground: '#18181b',
                    diffViewerTitleColor: '#e4e4e7',
                    addedBackground: '#064e3b',
                    addedColor: '#34d399',
                    removedBackground: '#7f1d1d',
                    removedColor: '#f87171',
                    wordAddedBackground: '#047857',
                    wordRemovedBackground: '#991b1b',
                  }
                },
                line: {
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '13px',
                }
              }}
            />
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
