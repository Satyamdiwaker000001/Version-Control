import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NoteTree } from './NoteTree';
import { NoteEditor } from './NoteEditor';
import { NoteMetadataPanel } from '@/features/notes/components/NoteMetadataPanel';
import { AIPanel } from '@/features/ai/components/AIPanel';
import { PanelRight, PanelRightClose } from 'lucide-react';

export const NoteEditorPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentNoteId = searchParams.get('noteId');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const handleSelectNote = (id: string) => {
    setSearchParams({ noteId: id });
  };

  return (
    <div className="flex h-full bg-background border-t border-border overflow-hidden">

      {/* Pane 1: Note Tree */}
      <div className="hidden md:block shrink-0">
        <NoteTree
          selectedId={currentNoteId}
          onSelectNote={handleSelectNote}
        />
      </div>

      {/* Pane 2: Editor */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <NoteEditor
          noteId={currentNoteId}
          onTogglePanel={() => setRightPanelOpen(v => !v)}
          isPanelOpen={rightPanelOpen}
        />
      </div>

      {/* Pane 3: Metadata panel */}
      {currentNoteId && rightPanelOpen && (
        <div className="hidden lg:flex flex-col shrink-0 border-l border-border h-full overflow-hidden">
          <div className="flex-1 min-h-[55%] overflow-hidden">
            <NoteMetadataPanel noteId={currentNoteId} />
          </div>
          <div className="h-px bg-border" />
          <div className="flex-1 min-h-[30%] overflow-hidden">
            <AIPanel noteId={currentNoteId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditorPage;
