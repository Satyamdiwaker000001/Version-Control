import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NoteTree } from './NoteTree';
import { NoteEditor } from './NoteEditor';
import { NoteMetadataPanel } from '@/features/notes/components/NoteMetadataPanel';
import { AIPanel } from '@/features/ai/components/AIPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Info, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';

export const NoteEditorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentNoteId = searchParams.get('noteId');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [showMobileTree, setShowMobileTree] = useState(false);
  const [aiFocusCount, setAiFocusCount] = useState(0);

  const handleSelectNote = (id: string) => {
    setSearchParams({ noteId: id });
    setShowMobileTree(false);
  };

  return (
    <div className="flex h-full bg-background border-t border-border overflow-hidden relative">

      {/* Pane 1: Note Tree (Desktop) */}
      <div className="hidden md:block shrink-0">
        <NoteTree
          selectedId={currentNoteId}
          onSelectNote={handleSelectNote}
        />
      </div>

      {/* Pane 1: Note Tree (Mobile Overlay) */}
      <AnimatePresence>
        {showMobileTree && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileTree(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-card border-r border-border z-40 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <h3 className="font-bold">Notes</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileTree(false)}>
                  <X size={18} />
                </Button>
              </div>
                <div className="flex-1 overflow-y-auto">
                <NoteTree
                  selectedId={currentNoteId}
                  onSelectNote={handleSelectNote}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pane 2: Editor */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile quick toggles */}
        <div className="flex md:hidden items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMobileTree(true)}
            className="gap-2 text-[11px] h-8"
          >
            <List size={14} /> Notes
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={cn("gap-2 text-[11px] h-8", rightPanelOpen && "bg-primary/10 text-primary border-primary/30")}
          >
            <Info size={14} /> Details
          </Button>
        </div>

        <NoteEditor
          key={currentNoteId}
          noteId={currentNoteId}
          onSelectNote={handleSelectNote}
          onTogglePanel={() => setRightPanelOpen(v => !v)}
          isPanelOpen={rightPanelOpen}
          onAiClick={() => {
            setRightPanelOpen(true);
            setAiFocusCount(v => v + 1);
          }}
        />
      </div>

      {/* Pane 3: Metadata panel (Desktop) */}
      {currentNoteId && rightPanelOpen && (
        <div className="hidden lg:flex flex-col shrink-0 border-l border-border h-full overflow-hidden w-80">
          <div className="flex-1 min-h-[50%] overflow-hidden">
            <NoteMetadataPanel noteId={currentNoteId} forceCollapse={aiFocusCount} />
          </div>
          <div className="h-px bg-border" />
          <div className="flex-1 min-h-[30%] overflow-hidden">
            <AIPanel key={currentNoteId} noteId={currentNoteId} />
          </div>
        </div>
      )}

      {/* Pane 3: Metadata panel (Mobile/Tablet Overlay) */}
      <AnimatePresence>
        {currentNoteId && rightPanelOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[320px] sm:w-[350px] bg-card border-l border-border z-40 lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold">Note Info</h3>
              <Button variant="ghost" size="sm" onClick={() => setRightPanelOpen(false)}>
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NoteMetadataPanel noteId={currentNoteId} forceCollapse={aiFocusCount} />
              <div className="h-px bg-border my-4" />
              <AIPanel key={currentNoteId} noteId={currentNoteId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteEditorPage;
