import { useState, useMemo, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { NodeObject } from 'react-force-graph-2d';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import type { NoteState } from '@/features/notes/store/useNoteStore';
import { useThemeStore } from '@/shared/store/useThemeStore';
import type { ThemeState } from '@/shared/store/useThemeStore';
import { useTagStore } from '@/features/tags/store/useTagStore';
import { Network, ZoomIn, ZoomOut, Filter, Tag as TagIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  fontColor: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  color: string;
}

const HIGHLIGHT_COLOR = '#8b5cf6'; // Violet
const HIGHLIGHT_NODE_COLOR = '#a78bfa'; // Lighter violet

export const GraphPage = () => {
  const notes = useNoteStore((state: NoteState) => state.notes);
  const isDarkMode = useThemeStore((state: ThemeState) => state.isDarkMode);
  const navigate = useNavigate();
  const fgRef = useRef<any>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const { tags, loadTags } = useTagStore();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  
  // Track neighbors for highlight effect
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<GraphLink>());
  
  useEffect(() => {
    if (tags.length === 0) loadTags();
  }, [tags.length, loadTags]);

  useEffect(() => {
    if (containerRef) {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || !entries.length) return;
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      });
      resizeObserver.observe(containerRef);
      return () => resizeObserver.disconnect();
    }
  }, [containerRef]);

  // Transform notes into Graph Data
  const graphData = useMemo(() => {
    // 1. Filter nodes based on active tag
    const filteredNotes = activeTag 
      ? notes.filter(n => n.tags.includes(activeTag))
      : notes;

    const nodes: GraphNode[] = filteredNotes.map((n: any) => ({
      id: n.id,
      name: n.title,
      val: Math.max(n.backlinks.length * 2, 4), // Size based on connections
      color: n.isPinned 
        ? (isDarkMode ? '#818cf8' : '#6366f1') // Indigo for pinned
        : (isDarkMode ? '#3f3f46' : '#e4e4e7'), // Zinc for normal
      fontColor: isDarkMode ? '#f4f4f5' : '#18181b',
    }));

    const links: GraphLink[] = [];
    filteredNotes.forEach((note: any) => {
      note.backlinks.forEach((linkTargetId: string) => {
        // Only link if target node exists in current filtered set
        if (nodes.find(n => n.id === linkTargetId)) {
          links.push({
            source: note.id,
            target: linkTargetId,
            color: isDarkMode ? '#52525b' : '#d4d4d8'
          });
        }
      });
    });

    return { nodes, links };
  }, [notes, isDarkMode, activeTag]);

  const handleNodeHover = (node: GraphNode | NodeObject | null) => {
    if (node) {
      const graphNode = node as GraphNode;
      const neighbors = new Set<string>();
      const neighborLinks = new Set<GraphLink>();

      // Find all neighbors
      graphData.links.forEach((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sourceId === graphNode.id) {
          neighbors.add(targetId);
          neighborLinks.add(link);
        } else if (targetId === graphNode.id) {
          neighbors.add(sourceId);
          neighborLinks.add(link);
        }
      });

      setHoverNode(graphNode.id);
      setHighlightNodes(neighbors);
      setHighlightLinks(neighborLinks);
    } else {
      setHoverNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    navigate(`/editor?noteId=${node.id}`);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
      
      {/* Search & Filter Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-lg pointer-events-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
            <Network size={18} className="text-indigo-500" /> Knowledge Graph
          </div>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700"></div>
          <div className="flex gap-2 relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Filter size={14} /> {activeTag ? `Tag: ${activeTag}` : 'Filter Tags'}
            </button>
            <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto p-2 flex flex-col gap-1 max-h-64 overflow-y-auto z-50">
               <button 
                 onClick={() => setActiveTag(null)}
                 className={cn("text-left px-3 py-1.5 text-xs rounded-md transition-colors", !activeTag ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800")}
               >
                 All Tags
               </button>
               {tags.map(t => (
                 <button 
                   key={t.id}
                   onClick={() => setActiveTag(t.name)}
                   className={cn("text-left px-3 py-1.5 text-xs flex items-center gap-2 rounded-md transition-colors", activeTag === t.name ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800")}
                 >
                   <TagIcon size={12} className={activeTag === t.name ? "text-indigo-500" : "text-zinc-400"} />
                   <span className="truncate">{t.name}</span>
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 shadow-lg pointer-events-auto flex flex-col gap-1">
          <button 
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.2, 400)}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.2, 400)}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>

      {/* Force Directed Graph Canvas */}
      <div className="flex-1 w-full relative" ref={setContainerRef}>
        {containerRef && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeRelSize={6}
            linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1.5}
            linkColor={(link: any) => highlightLinks.has(link) ? HIGHLIGHT_COLOR : isDarkMode ? '#52525b' : '#d4d4d8'}
            onNodeHover={handleNodeHover}
            onNodeClick={(node: GraphNode | NodeObject) => handleNodeClick(node as GraphNode)}
            nodeCanvasObject={(node: GraphNode | NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const graphNode = node as GraphNode;
              if (graphNode.x === undefined || graphNode.y === undefined) return;
              
              const label = graphNode.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              
              // Handle dimming effect when hovering other nodes
              const isHovered = hoverNode === graphNode.id;
              const isNeighbor = highlightNodes.has(graphNode.id);
              const isFaded = hoverNode && !isHovered && !isNeighbor;

              // Draw Node Circle
              ctx.beginPath();
              ctx.arc(graphNode.x, graphNode.y, graphNode.val, 0, 2 * Math.PI, false);
              
              if (isHovered) {
                ctx.fillStyle = HIGHLIGHT_NODE_COLOR;
              } else if (isNeighbor) {
                ctx.fillStyle = HIGHLIGHT_COLOR;
              } else if (isFaded) {
                ctx.fillStyle = isDarkMode ? '#27272a' : '#f4f4f5'; // very faded
              } else {
                ctx.fillStyle = graphNode.color;
              }
              ctx.fill();

              // Draw Label if hovered or highly connected
              if (!isFaded && (graphNode.val > 6 || isHovered || isNeighbor || globalScale > 1.5)) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isHovered || isNeighbor ? (isDarkMode ? '#ffffff' : '#000000') : graphNode.fontColor;
                ctx.fillText(label, graphNode.x, graphNode.y + graphNode.val + (fontSize * 1.2));
              }
            }}
          />
        )}
      </div>

    </div>
  );
};

export default GraphPage;
