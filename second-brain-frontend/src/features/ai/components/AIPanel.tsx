import { useState } from 'react';
import { Sparkles, RefreshCw, Layers, Network } from 'lucide-react';
import { useNoteStore } from '@/features/notes/store/useNoteStore';

export const AIPanel = ({ noteId }: { noteId: string }) => {
  const note = useNoteStore(state => state.notes.find(n => n.id === noteId));
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  
  const [isAnalyzingCode, setIsAnalyzingCode] = useState(false);
  const [codeExplanation, setCodeExplanation] = useState<string | null>(null);
  
  const [isArchSummarizing, setIsArchSummarizing] = useState(false);

  if (!note) return null;

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAiSummary(`This document explores the fundamental paradigms spanning across ${note.title}, placing particular emphasis on the conceptual intersections between its ${note.tags.length} major topics. It serves as a foundational reference for future branching.`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleExplainCode = () => {
    setIsAnalyzingCode(true);
    setTimeout(() => {
      setCodeExplanation("The selected logic performs a recursive directory traversal to identify unmapped path dependencies. It leverages Node's fs module iteratively to preserve memory.");
      setIsAnalyzingCode(false);
    }, 2000);
  };

  const handleArchSummary = () => {
    setIsArchSummarizing(true);
    setTimeout(() => {
      setCodeExplanation("Based on the repository imports, this project uses a layered architecture separating React View controllers in /components from pure Zustand state logic in /store.");
      setIsArchSummarizing(false);
    }, 2500);
  };

  return (
    <div className="w-64 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-fuchsia-50/50 dark:bg-fuchsia-900/10">
        <h3 className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-400 flex items-center gap-2">
          <Sparkles size={16} /> Knowledge Engine
        </h3>
        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">AI Assistant</p>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-4">
        
        {/* Magic Summary */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-sm">
           <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
             <Layers size={14} className="text-emerald-500" /> Executive Summary
           </div>
           
           {aiSummary ? (
             <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
               {aiSummary}
             </div>
           ) : (
             <button 
               onClick={handleGenerateSummary}
               disabled={isGenerating}
               className="w-full flex justify-center items-center gap-2 py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded transition-colors"
             >
               {isGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
               {isGenerating ? 'Analyzing...' : 'Generate Auto-Summary'}
             </button>
           )}
        </div>

        {/* Code Understanding */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-sm">
           <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
             <Sparkles size={14} className="text-purple-500" /> Code Intelligence
           </div>
           
           {codeExplanation ? (
             <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded border border-zinc-100 dark:border-zinc-800">
               {codeExplanation}
               <button 
                 onClick={() => setCodeExplanation(null)}
                 className="mt-2 text-indigo-500 font-medium hover:underline text-[10px]"
               >
                 Clear Analysis
               </button>
             </div>
           ) : (
             <div className="flex flex-col gap-2">
               <button 
                 onClick={handleExplainCode}
                 disabled={isAnalyzingCode}
                 className="w-full flex justify-center items-center gap-2 py-1.5 px-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded transition-colors"
               >
                 {isAnalyzingCode ? <RefreshCw size={12} className="animate-spin" /> : <Layers size={12} />}
                 Explain Selection
               </button>
               <button 
                 onClick={handleArchSummary}
                 disabled={isArchSummarizing}
                 className="w-full flex justify-center items-center gap-2 py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded transition-colors"
               >
                 {isArchSummarizing ? <RefreshCw size={12} className="animate-spin" /> : <Network size={12} />}
                 Summarize Architecture
               </button>
             </div>
           )}
        </div>

        {/* Suggested Connections */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-sm opacity-60">
           <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
             <Network size={14} className="text-indigo-500" /> Suggested Links
           </div>
           <p className="text-[10px] text-zinc-500 mb-2 italic">Based on semantic similarity</p>
           <div className="space-y-1.5">
             <div className="flex items-center gap-2 px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-400 cursor-not-allowed">
               <span className="truncate">Transformer Architecture</span>
               <span className="text-[10px] text-emerald-500 ml-auto font-medium">92%</span>
             </div>
             <div className="flex items-center gap-2 px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-400 cursor-not-allowed">
               <span className="truncate">Attention Mechanism</span>
               <span className="text-[10px] text-emerald-500 ml-auto font-medium">85%</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};
