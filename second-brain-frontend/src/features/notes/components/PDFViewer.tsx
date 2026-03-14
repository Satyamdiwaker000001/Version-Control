import { useState, useRef } from 'react';
import { X, Maximize2, FileText, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface PDFViewerProps {
  dataUrl: string;
  fileName: string;
  fileSize: number;
  onClose?: () => void;
}

interface InlineViewerProps {
  expanded?: boolean;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  onClose?: () => void;
  onExpand: () => void;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const InlineViewer = ({ expanded = false, dataUrl, fileName, fileSize, onClose, onExpand }: InlineViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className={cn(
      "pdf-viewer-embed my-4 border rounded-lg bg-card text-card-foreground",
      expanded && "fixed inset-4 z-[400] bg-card shadow-2xl rounded-2xl flex flex-col"
    )}>
      <div className="pdf-header flex items-center justify-between px-3 py-2 border-b border-border bg-accent/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
            <FileText size={14} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{fileName}</p>
            <p className="text-[10px] text-muted-foreground">{formatSize(fileSize)} · PDF</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleRotate}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            title="Rotate"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors text-xs"
            title="Reset View"
          >
            Reset
          </button>
          <button
            onClick={onExpand}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            title={expanded ? "Minimize" : "Fullscreen"}
          >
            <Maximize2 size={14} />
          </button>
          <a
            href={dataUrl}
            download={fileName}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            title="Download PDF"
          >
            <Download size={14} />
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              title="Remove"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className={cn("flex-1 overflow-auto", expanded ? "p-4" : "p-2")}>
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.2s ease-in-out' }}
        >
          <iframe
            ref={iframeRef}
            src={dataUrl}
            className={cn(
              "border-none rounded-lg bg-white shadow-lg",
              expanded ? "max-w-full max-h-full" : "w-full h-[560px]"
            )}
            style={{ 
              width: expanded ? '100%' : `${560 * zoom}px`,
              height: expanded ? '100%' : `${560 * zoom}px`
            }}
            title={fileName}
          />
        </div>
      </div>
    </div>
  );
};

export const PDFViewer = ({ dataUrl, fileName, fileSize, onClose }: PDFViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <InlineViewer 
        dataUrl={dataUrl}
        fileName={fileName}
        fileSize={fileSize}
        onClose={onClose}
        onExpand={() => setIsExpanded(!isExpanded)}
      />
      {isExpanded && (
        <div className="fixed inset-0 z-[399] bg-background/60 backdrop-blur-sm" onClick={() => setIsExpanded(false)} />
      )}
      {isExpanded && <InlineViewer 
        expanded 
        dataUrl={dataUrl}
        fileName={fileName}
        fileSize={fileSize}
        onClose={onClose}
        onExpand={() => setIsExpanded(!isExpanded)}
      />}
    </>
  );
};
