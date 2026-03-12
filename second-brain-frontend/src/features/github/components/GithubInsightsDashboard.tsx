import { BrainCircuit, BookCheck, GitBranch, TerminalSquare } from 'lucide-react';
import { useNotesContext } from '@/shared/contexts/NotesContext';

export const GithubInsightsDashboard = () => {
  const { notes } = useNotesContext();
  
  // Calculate mock insights
  const repoLinkedNotes = notes.filter(n => n.linkedRepositoryId).length;
  const commitLinkedNotes = notes.filter(n => n.linkedCommitSha).length;
  
  const stats = [
    {
      title: "Knowledge Coverage",
      metric: "18%",
      description: "of integrated codebases are documented",
      icon: BookCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      title: "Contextual Notes",
      metric: repoLinkedNotes.toString(),
      description: "notes linked to repositories",
      icon: TerminalSquare,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-500/10"
    },
    {
      title: "Commit Insights",
      metric: commitLinkedNotes.toString(),
      description: "commits with attached explanations",
      icon: GitBranch,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      title: "AI Analysis",
      metric: "43",
      description: "code snippets analyzed by AI",
      icon: BrainCircuit,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10"
    }
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          Repository Understanding Metrics
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{stat.title}</p>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="relative z-10 mt-2">
                <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white">{stat.metric}</h3>
                <p className="text-xs text-zinc-500 mt-1">{stat.description}</p>
              </div>
              
              {/* Decorative background glow */}
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-500 ${stat.bg}`}></div>
            </div>
          )
        })}
      </div>
      
      {/* Visual Progress Bar */}
      <div className="mt-4 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
         <div className="flex justify-between items-end mb-2">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white text-sm">Global Codebase Documentation Progress</p>
              <p className="text-xs text-zinc-500">How much of your organization's code has Knowledge mapped to it.</p>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">18% mapped</span>
         </div>
         <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden flex">
            <div className="h-full bg-indigo-500 w-[12%]" title="Architecture Notes"></div>
            <div className="h-full bg-purple-500 w-[4%]" title="API Contracts"></div>
            <div className="h-full bg-emerald-500 w-[2%]" title="Commit Explanations"></div>
         </div>
         <div className="flex gap-4 mt-3 text-[10px] font-medium text-zinc-500">
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Architecture Notes</span>
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> API Contracts</span>
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Commit Explanations</span>
         </div>
      </div>
    </div>
  );
};
