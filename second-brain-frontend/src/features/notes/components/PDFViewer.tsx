import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2, FileText } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface PDFViewerProps {
  dataUrl: string;
  fileName: string;
  fileSize: number;
  onClose?: () => void;
}

export const PDFViewer = ({ dataUrl, fileName, fileSize, onClose }: PDFViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Use an iframe with the base64 PDF data
  const InlineViewer = ({ expanded = false }) => (
    <div className={cn(
      "pdf-viewer-embed",
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
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            title={isExpanded ? "Minimize" : "Fullscreen"}
          >
            <Maximize2 size={14} />
          </button>
          <a
            href={dataUrl}
            download={fileName}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            title="Download PDF"
          >
            <ChevronRight size={14} />
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
        <iframe
          src={dataUrl}
          className={cn(
            "w-full border-none rounded-lg bg-white",
            expanded ? "h-full" : "h-[400px]"
          )}
          title={fileName}
        />
      </div>
    </div>
  );

  return (
    <>
      <InlineViewer />
      {isExpanded && (
        <div className="fixed inset-0 z-[399] bg-background/60 backdrop-blur-sm" onClick={() => setIsExpanded(false)} />
      )}
      {isExpanded && <InlineViewer expanded />}
    </>
  );
};
