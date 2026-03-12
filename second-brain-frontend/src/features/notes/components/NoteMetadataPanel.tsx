import { useState } from 'react';
import { useNoteStore, MOCK_TEAM_MEMBERS } from '@/features/notes/store/useNoteStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import {
  Hash, Link2, GitCommit, ChevronDown, ChevronRight,
  Activity, Pin, ExternalLink, Plus, Clock,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { VersionDiffViewer } from '@/features/notes/components/VersionDiffViewer';
import { cn } from '@/shared/utils/cn';

interface SectionProps {
  label: string;
  count?: number;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Section = ({ label, count, icon, isOpen, onToggle, children }: SectionProps) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-lg transition-colors"
    >
      {isOpen ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
    {isOpen && <div className="pl-2 pr-2 pb-2">{children}</div>}
  </div>
);

export const NoteMetadataPanel = ({ noteId }: { noteId: string }) => {
  const note = useNoteStore(state => state.notes.find(n => n.id === noteId));
  const allNotes = useNoteStore(state => state.notes);
  const teamActivity = useNoteStore(state => state.teamActivity);
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const isTeam = activeWorkspace?.type === 'team';

  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isLinkedOpen, setIsLinkedOpen] = useState(true);
  const [isVersionsOpen, setIsVersionsOpen] = useState(true);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  if (!note) return null;

  // Resolve backlink titles
  const backlinkNotes = note.backlinks
    .map(id => allNotes.find(n => n.id === id))
    .filter(Boolean);

  // Build a version history (real activity + mock older entries)
  const noteActivity = isTeam
    ? teamActivity
        .filter(a => a.noteId === note.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  // Mock older versions from versionCount
  const mockVersions = Array.from({ length: Math.max(0, note.versionCount - noteActivity.length - 1) }, (_, i) => ({
    version: note.versionCount - noteActivity.length - i - 1,
    ago: `${noteActivity.length + i + 1} hours ago`,
  }));

  return (
    <div className="w-64 bg-card flex flex-col h-full overflow-y-auto">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity size={15} className="text-primary" /> Page Details
        </h3>
        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
          <Clock size={10} />
          Last edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </p>
        {note.isPinned && (
          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Pin size={10} className="fill-amber-500" /> Pinned / Starred
          </span>
        )}
      </div>

      {/* Sections */}
      <div className="flex-1 p-2 space-y-1">

        {/* Tags */}
        <Section
          label="Tags"
          count={note.tags.length}
          icon={<Hash size={13} className="text-muted-foreground" />}
          isOpen={isTagsOpen}
          onToggle={() => setIsTagsOpen(v => !v)}
        >
          <div className="flex flex-wrap gap-1.5 pt-1 pl-4">
            {note.tags.length === 0 && (
              <p className="text-xs text-muted-foreground/50 italic">No tags yet.</p>
            )}
            {note.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
              >
                <Hash size={10} /> {tag}
              </span>
            ))}
            <button className="flex items-center gap-1 px-2 py-0.5 border border-dashed border-border text-muted-foreground/50 text-[11px] rounded-full hover:border-primary/50 hover:text-primary transition-colors">
              <Plus size={10} /> Add
            </button>
          </div>
        </Section>

        {/* Backlinks */}
        <Section
          label="Backlinks"
          count={backlinkNotes.length}
          icon={<Link2 size={13} className="text-muted-foreground" />}
          isOpen={isLinkedOpen}
          onToggle={() => setIsLinkedOpen(v => !v)}
        >
          <div className="space-y-1 pt-1 pl-4">
            {backlinkNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 italic">No notes link here yet.</p>
            ) : (
              backlinkNotes.map(linked => (
                <button
                  key={linked!.id}
                  className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-1 group"
                >
                  <Link2 size={11} className="text-muted-foreground/40 group-hover:text-primary shrink-0" />
                  <span className="truncate text-left">{linked!.title}</span>
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                </button>
              ))
            )}
          </div>
        </Section>

        {/* Version History */}
        <Section
          label="Version History"
          count={note.versionCount}
          icon={<GitCommit size={13} className="text-muted-foreground" />}
          isOpen={isVersionsOpen}
          onToggle={() => setIsVersionsOpen(v => !v)}
        >
          <div className="pt-2 pl-4 pr-2">
            <div className="relative border-l-2 border-border pl-4 space-y-4">

              {/* Current version */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {note.latestVersionId} — Current
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Team activity entries */}
              {noteActivity.map((act, i) => {
                const author = MOCK_TEAM_MEMBERS.find(m => m.id === act.authorId);
                return (
                  <div key={i} className="relative">
                    <span
                      className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full ring-2 ring-background"
                      style={{ backgroundColor: author?.color || '#8b5cf6' }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {isTeam && author && (
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: author.color }}
                          >
                            {author.name === 'You' ? 'You' : author.name.split(' ')[0]}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{act.action}</span>
                      </div>
                      {act.commitMessage && (
                        <p className="text-[11px] text-foreground/70 italic truncate">
                          "{act.commitMessage}"
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                        {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Older mock versions */}
              {mockVersions.map((v, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-secondary ring-2 ring-background" />
                  <p className="text-xs font-medium text-muted-foreground">v{v.version}</p>
                  <p className="text-[10px] text-muted-foreground/50">{v.ago}</p>
                </div>
              ))}

            </div>

            <button
              onClick={() => setIsDiffOpen(true)}
              className="w-full mt-4 py-2 text-xs font-medium text-muted-foreground bg-accent hover:bg-accent/70 rounded-lg transition-colors border border-border hover:border-primary/30 hover:text-primary flex items-center justify-center gap-2"
            >
              <GitCommit size={12} /> View Diff Timeline
            </button>
          </div>
        </Section>

      </div>

      {isDiffOpen && (
        <VersionDiffViewer
          isOpen={isDiffOpen}
          onClose={() => setIsDiffOpen(false)}
          oldVersionId={note.versionCount > 1 ? `v${note.versionCount - 1}` : note.latestVersionId}
          newVersionId={note.latestVersionId}
          oldCode={note.versionCount > 1 ? note.content.replace('...', '.\n\n[Previous version]') : note.content}
          newCode={note.content}
          onRestore={() => {}}
        />
      )}
    </div>
  );
};
