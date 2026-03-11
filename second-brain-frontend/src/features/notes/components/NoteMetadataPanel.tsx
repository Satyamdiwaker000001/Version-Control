import { useState } from 'react';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { Hash, Link, GitCommit, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VersionDiffViewer } from '@/features/notes/components/VersionDiffViewer';

export const NoteMetadataPanel = ({ noteId }: { noteId: string }) => {
  const note = useNoteStore(state => state.notes.find(n => n.id === noteId));
  
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isLinkedOpen, setIsLinkedOpen] = useState(true);
  const [isVersionsOpen, setIsVersionsOpen] = useState(true);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  if (!note) return null;

  return (
    <div className="w-64 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-锌-100 flex items-center gap-2">
          <Activity size={16} className="text-zinc-500" /> Page Details
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Last edited {formatDistanceToNow(new Date(note.updatedAt))} ago
        </p>
      </div>

      <div className="p-2 space-y-4 flex-1">
        
        {/* Tags Section */}
        <div>
          <div 
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded transition-colors"
          >
            {isTagsOpen ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronRight size={14} className="text-zinc-400" />}
            <span className="flex-1">Tags</span>
            <span className="text-xs text-zinc-400">{note.tags.length}</span>
          </div>
          {isTagsOpen && (
            <div className="pl-6 pr-2 pt-1 pb-2 flex flex-wrap gap-2">
              {note.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-md">
                  <Hash size={12} /> {tag}
                </span>
              ))}
              <span className="flex items-center justify-center px-2 py-1 border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-xs rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                + Add tag
              </span>
            </div>
          )}
        </div>

        {/* Backlinks Section */}
        <div>
          <div 
            onClick={() => setIsLinkedOpen(!isLinkedOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded transition-colors"
          >
            {isLinkedOpen ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronRight size={14} className="text-zinc-400" />}
            <span className="flex-1">Backlinks</span>
            <span className="text-xs text-zinc-400">{note.backlinks.length}</span>
          </div>
          {isLinkedOpen && (
            <div className="pl-6 pr-2 pt-1 pb-2 space-y-2">
              {note.backlinks.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No notes link here.</p>
              ) : (
                note.backlinks.map(linkId => (
                  <div key={linkId} className="flex items-start gap-2 group cursor-pointer">
                    <Link size={14} className="text-zinc-400 mt-0.5 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-500 transition-colors underline-offset-2 group-hover:underline">
                      {linkId === 'n1' ? 'Neural Networks Basics' : `Note ${linkId}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Version History Quick Glance */}
        <div>
          <div 
            onClick={() => setIsVersionsOpen(!isVersionsOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded transition-colors"
          >
            {isVersionsOpen ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronRight size={14} className="text-zinc-400" />}
            <span className="flex-1">Version History</span>
            <span className="text-xs text-zinc-400">{note.versionCount} commits</span>
          </div>
          {isVersionsOpen && (
            <div className="pl-6 pr-2 pt-2 pb-2">
               <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 py-1 space-y-4">
                 
                 {/* Latest Version */}
                 <div className="relative group cursor-pointer">
                   <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-zinc-950" />
                   <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">{note.latestVersionId} (Current)</p>
                   <p className="text-[10px] text-zinc-500">Just now</p>
                 </div>

                 {/* Mock Historical Version */}
                 <div className="relative group cursor-pointer">
                   <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
                   <div className="flex justify-between items-center group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                     <p className="text-xs font-medium text-zinc-500">v{note.versionCount - 1}</p>
                     <GitCommit size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100" />
                   </div>
                   <p className="text-[10px] text-zinc-500">2 hrs ago</p>
                 </div>

                 {note.versionCount > 2 && (
                   <div className="relative">
                     <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
                     <p className="text-xs text-zinc-500 hover:text-indigo-500 cursor-pointer">+{note.versionCount - 2} older versions...</p>
                   </div>
                 )}

               </div>
               <button 
                 onClick={() => setIsDiffOpen(true)}
                 className="w-full mt-4 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
               >
                 View Diff Timeline
               </button>
            </div>
          )}
        </div>

      </div>

      {isDiffOpen && (
        <VersionDiffViewer
          isOpen={isDiffOpen}
          onClose={() => setIsDiffOpen(false)}
          oldVersionId={note.versionCount > 1 ? `v${note.versionCount - 1}` : note.latestVersionId}
          newVersionId={note.latestVersionId}
          oldCode={note.versionCount > 1 ? note.content.replace('...', '.\n\n[Version History Mock - Previous Sentence Deleted]') : note.content}
          newCode={note.content}
          onRestore={() => console.log('Restore triggered')}
        />
      )}
    </div>
  );
};
