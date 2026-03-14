import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  GitBranch, 
  Clock, 
  FilePlus, 
  FileEdit, 
  FileMinus,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface GitCommitData {
  id: string;
  sha: string;
  message: string;
  author: {
    name: string;
    avatar?: string;
    color: string;
  };
  date: string;
  branch: string;
  status: 'merged' | 'active' | 'referenced';
  changes: {
    added: number;
    modified: number;
    removed: number;
  };
  noteId?: string;
}

interface GitGraphProps {
  commits: GitCommitData[];
  onCommitClick?: (commit: GitCommitData) => void;
  className?: string;
}

const BRANCH_COLORS: Record<string, string> = {
  'master': '#3b82f6',
  'main': '#3b82f6',
  'dev': '#10b981',
  'feat/analytics': '#8b5cf6',
  'fix/auth': '#ef4444',
  'staging': '#f1c40f',
  'nlp': '#e67e22',
  'machine-learning': '#9b59b6',
  'research': '#1abc9c',
  'roadmap': '#34495e',
};

const getBranchColor = (branch: string) => {
  return BRANCH_COLORS[branch] || '#6366f1';
};

// Card height + gap between cards
const CARD_HEIGHT = 110;  // actual visible card height
const CARD_GAP = 20;      // gap between cards
const ITEM_HEIGHT = CARD_HEIGHT + CARD_GAP; // total row height = 130px
const NODE_CENTER_Y = CARD_HEIGHT / 2;       // vertical center of node dot (55px from top)

export const GitGraph: React.FC<GitGraphProps> = ({ commits, onCommitClick, className }) => {
  const branches = useMemo(() => Array.from(new Set(commits.map(c => c.branch))), [commits]);
  const branchOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    branches.forEach((b, i) => {
      offsets[b] = i * 32 + 28; // 32px apart, starting at 28
    });
    return offsets;
  }, [branches]);

  // Calculate dynamic left margin: rightmost branch dot + comfortable gap
  const maxBranchX = useMemo(() => {
    const maxX = Math.max(...Object.values(branchOffsets));
    return maxX + 40; // 40px gap after the rightmost node dot
  }, [branchOffsets]);

  const totalHeight = commits.length * ITEM_HEIGHT;

  return (
    <div className={cn("flex flex-col gap-0 p-4 sm:p-8", className)}>
      <div className="relative" style={{ height: totalHeight }}>
        {/* SVG Layer for Curvy Lines */}
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          width="100%"
          height="100%"
        >
          <defs>
            {branches.map(branch => (
              <linearGradient key={branch} id={`grad-${branch}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={getBranchColor(branch)} stopOpacity="0.4" />
                <stop offset="100%" stopColor={getBranchColor(branch)} stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>

          {/* Branch Vertical Rails (dashed) */}
          {branches.map((branch) => {
            const x = branchOffsets[branch];
            const branchCommits = commits.filter(c => c.branch === branch);
            if (branchCommits.length === 0) return null;

            const firstIdx = commits.indexOf(branchCommits[0]);
            const lastIdx = commits.indexOf(branchCommits[branchCommits.length - 1]);

            return (
              <line
                key={`rail-${branch}`}
                x1={x}
                y1={firstIdx * ITEM_HEIGHT + NODE_CENTER_Y}
                x2={x}
                y2={lastIdx * ITEM_HEIGHT + NODE_CENTER_Y}
                stroke={getBranchColor(branch)}
                strokeWidth="2"
                strokeOpacity="0.15"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Connection Lines (Bezier Curves) */}
          {commits.map((commit, i) => {
            if (i === commits.length - 1) return null;
            const nextCommit = commits[i + 1];
            const x1 = branchOffsets[commit.branch];
            const y1 = i * ITEM_HEIGHT + NODE_CENTER_Y;
            const x2 = branchOffsets[nextCommit.branch];
            const y2 = (i + 1) * ITEM_HEIGHT + NODE_CENTER_Y;

            if (commit.branch === nextCommit.branch) {
              return (
                <line
                  key={`line-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={getBranchColor(commit.branch)}
                  strokeWidth="3"
                  strokeOpacity="0.6"
                />
              );
            }

            const cpY = (y1 + y2) / 2;
            return (
              <path
                key={`curve-${i}`}
                d={`M ${x1} ${y1} C ${x1} ${cpY}, ${x2} ${cpY}, ${x2} ${y2}`}
                fill="none"
                stroke={getBranchColor(commit.branch)}
                strokeWidth="3"
                strokeOpacity="0.4"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Labels & Nodes Container */}
        <div className="absolute inset-0">
          {commits.map((commit, index) => {
            const branchX = branchOffsets[commit.branch];
            const branchColor = getBranchColor(commit.branch);

            return (
              <div
                key={commit.sha}
                className="absolute w-full group"
                style={{ top: index * ITEM_HEIGHT, height: CARD_HEIGHT }}
              >
                {/* Node dot — centered vertically on card */}
                <div
                  className="absolute z-20 transition-transform duration-300 group-hover:scale-125 cursor-pointer"
                  style={{ left: branchX - 8, top: NODE_CENTER_Y - 8 }}
                  onClick={() => onCommitClick?.(commit)}
                >
                  <div
                    className="w-4 h-4 rounded-full border-[3px] bg-background shadow-sm"
                    style={{ borderColor: branchColor }}
                  />
                  {commit.status === 'active' && (
                    <div
                      className="absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: branchColor }}
                    />
                  )}
                </div>

                {/* Commit Content Card — dynamic left margin based on branches */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="mr-4 sm:mr-8 glass border border-border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group/card relative z-10"
                  style={{ marginLeft: Math.max(maxBranchX, 176), minHeight: CARD_HEIGHT }}
                  onClick={() => onCommitClick?.(commit)}
                  title={`View details for: ${commit.message}`}
                >
                  {/* Branch color accent strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-50"
                    style={{ backgroundColor: branchColor }}
                  />

                  <div className="flex items-center justify-between gap-3 h-full">
                    {/* Left column: meta + message + author */}
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      {/* Row 1: SHA + Branch + Status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-accent/80 px-2 py-0.5 rounded border border-border/50 shrink-0">
                          {commit.sha.substring(0, 7)}
                        </span>
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm shrink-0"
                          style={{ borderColor: `${branchColor}40`, backgroundColor: `${branchColor}10`, color: branchColor }}
                        >
                          <GitBranch size={11} />
                          {commit.branch}
                        </div>
                        {commit.status === 'merged' && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
                      </div>

                      {/* Row 2: Commit message — full text, wraps if needed */}
                      <h3 className="text-sm sm:text-[15px] font-bold text-foreground group-hover/card:text-primary transition-colors leading-snug break-words">
                        {commit.message}
                      </h3>

                      {/* Row 3: Author + Time */}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm shrink-0"
                            style={{ backgroundColor: commit.author.color }}
                          >
                            {commit.author.name.charAt(0)}
                          </div>
                          <span className="max-w-[100px] truncate">{commit.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>{formatDistanceToNow(new Date(commit.date))} ago</span>
                        </div>
                      </div>
                    </div>

                    {/* Right column: change stats + explore */}
                    <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-3 bg-accent/40 px-3 py-2 rounded-xl border border-border/50">
                        <div className="flex items-center gap-1 text-emerald-500" title={`${commit.changes.added} additions`}>
                          <FilePlus size={11} strokeWidth={2.5} />
                          <span className="text-[10px] font-black">{commit.changes.added}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500" title={`${commit.changes.modified} modifications`}>
                          <FileEdit size={11} strokeWidth={2.5} />
                          <span className="text-[10px] font-black">{commit.changes.modified}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-500" title={`${commit.changes.removed} deletions`}>
                          <FileMinus size={11} strokeWidth={2.5} />
                          <span className="text-[10px] font-black">{commit.changes.removed}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px] font-black uppercase text-muted-foreground group-hover/card:text-primary transition-colors">
                        Explore <ExternalLink size={9} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
