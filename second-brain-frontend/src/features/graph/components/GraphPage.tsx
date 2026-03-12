import { useState, useMemo, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { NodeObject } from 'react-force-graph-2d';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import type { NoteState } from '@/features/notes/store/useNoteStore';
import { useThemeStore } from '@/shared/store/useThemeStore';
import type { ThemeState } from '@/shared/store/useThemeStore';
import { useTagStore } from '@/features/tags/store/useTagStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { Network, ZoomIn, ZoomOut, Filter, MousePointer2, Focus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/Button';

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  fontColor: string;
  isPinned: boolean;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  color: string;
}

export const GraphPage = () => {
  const notes = useNoteStore((state: NoteState) => state.notes);
  const isDarkMode = useThemeStore((state: ThemeState) => state.isDarkMode);
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const navigate = useNavigate();
  const fgRef = useRef<any>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const { tags, loadTags } = useTagStore();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  
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

  // Transform notes into Graph Data with Workspace Filtering
  const graphData = useMemo(() => {
    const workspaceNotes = notes.filter(n => n.workspaceId === activeWorkspace?.id);
    const filteredNotes = activeTag 
      ? workspaceNotes.filter(n => n.tags.includes(activeTag))
      : workspaceNotes;

    const nodes: GraphNode[] = filteredNotes.map((n: any) => ({
      id: n.id,
      name: n.title,
      val: Math.max((n.backlinks?.length || 0) * 3, 6),
      isPinned: !!n.isPinned,
      color: n.isPinned ? '#8b5cf6' : (isDarkMode ? '#3f3f46' : '#e4e4e7'),
      fontColor: isDarkMode ? '#a1a1aa' : '#71717a',
    }));

    const links: GraphLink[] = [];
    filteredNotes.forEach((note: any) => {
      note.backlinks?.forEach((linkTargetId: string) => {
        if (nodes.find(n => n.id === linkTargetId)) {
          links.push({
            source: note.id,
            target: linkTargetId,
            color: isDarkMode ? '#27272a' : '#f4f4f5'
          });
        }
      });
    });

    return { nodes, links };
  }, [notes, isDarkMode, activeTag, activeWorkspace]);

  const handleNodeHover = (node: GraphNode | NodeObject | null) => {
    if (node) {
      const graphNode = node as GraphNode;
      const neighbors = new Set<string>();
      const neighborLinks = new Set<GraphLink>();

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

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-700 relative overflow-hidden">
      
      {/* Premium Search & Control Interface */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <div className="glass border border-border rounded-2xl p-4 shadow-2xl flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Network size={22} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-extrabold tracking-tight text-foreground uppercase">Neural Graph</h1>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{activeWorkspace?.name || 'Local'}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="h-9 gap-2 text-xs font-bold text-muted-foreground hover:text-foreground group">
                  <Filter size={14} /> <span>{activeTag || 'ALL NODES'}</span>
               </Button>
               <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground group">
                  <MousePointer2 size={16} />
               </Button>
            </div>
          </div>
          
          {/* Active Tag Pills */}
          <div className="flex flex-wrap gap-2 max-w-sm">
             {tags.slice(0, 5).map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                    activeTag === tag.name 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-accent/50 text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  #{tag.name}
                </button>
             ))}
          </div>
        </div>

        <div className="glass border border-border rounded-2xl p-1.5 shadow-2xl pointer-events-auto flex flex-col gap-1">
          <Button variant="ghost" size="icon" onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 400)} className="h-10 w-10 text-muted-foreground">
            <ZoomIn size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 400)} className="h-10 w-10 text-muted-foreground">
            <ZoomOut size={18} />
          </Button>
          <div className="h-px w-6 bg-border mx-auto my-1"></div>
          <Button variant="ghost" size="icon" onClick={() => fgRef.current?.centerAt(0, 0, 400)} className="h-10 w-10 text-muted-foreground">
            <Focus size={18} />
          </Button>
        </div>
      </div>

      {/* Force Directed Graph Canvas */}
      <div className="flex-1 w-full h-full relative" ref={setContainerRef}>
        {containerRef && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeRelSize={2}
            linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
            linkColor={(link: any) => highlightLinks.has(link) ? '#8b5cf6' : isDarkMode ? '#27272a' : '#f1f1f1'}
            onNodeHover={handleNodeHover}
            onNodeClick={(node: any) => navigate(`/editor?noteId=${node.id}`)}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              
              const isHovered = hoverNode === node.id;
              const isNeighbor = highlightNodes.has(node.id);
              const isFaded = hoverNode && !isHovered && !isNeighbor;

              // Draw Pulse Effect for Pinned/Highlighted
              if ((node.isPinned || isHovered) && !isFaded) {
                const time = Date.now() / 1000;
                const pulse = Math.sin(time * 3) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val + (2 + pulse * 4) / globalScale, 0, 2 * Math.PI, false);
                ctx.fillStyle = isHovered ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)';
                ctx.fill();
              }

              // Draw Node
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
              
              if (isHovered) {
                ctx.fillStyle = '#8b5cf6';
              } else if (isNeighbor) {
                ctx.fillStyle = '#a78bfa';
              } else if (isFaded) {
                ctx.fillStyle = isDarkMode ? '#18181b' : '#fafafa';
              } else {
                ctx.fillStyle = node.color;
              }
              ctx.fill();

              // Draw Border
              ctx.strokeStyle = isHovered || isNeighbor ? '#8b5cf6' : (isDarkMode ? '#27272a' : '#e4e4e7');
              ctx.lineWidth = 1 / globalScale;
              ctx.stroke();

              // Draw Label
              if (!isFaded && (globalScale > 1.2 || isHovered || isNeighbor)) {
                ctx.font = `${isHovered || isNeighbor ? 'bold' : 'normal'} ${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isHovered || isNeighbor ? (isDarkMode ? '#ffffff' : '#000000') : node.fontColor;
                ctx.fillText(label, node.x, node.y + node.val + (fontSize * 1.5));
              }
            }}
          />
        )}
      </div>

      {/* Legend / Stats Footer */}
      <div className="absolute bottom-6 left-6 z-20 glass border border-border rounded-xl px-4 py-2 shadow-xl flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
         <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div> PINNED</div>
         <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-border"></div> STANDARD</div>
         <div className="flex items-center gap-1.5 text-foreground/80"><Network size={12} /> {graphData.nodes.length} NODES</div>
      </div>

    </div>
  );
};

export default GraphPage;
