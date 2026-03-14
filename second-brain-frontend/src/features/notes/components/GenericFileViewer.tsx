import { Download, File, X } from 'lucide-react';

interface GenericFileViewerProps {
  dataUrl: string;
  fileName: string;
  fileSize: number;
  onClose: () => void;
}

export const GenericFileViewer = ({ dataUrl, fileName, fileSize, onClose }: GenericFileViewerProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="my-4 p-3 border rounded-lg bg-card text-card-foreground flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <File size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-bold">{fileName}</p>
          <p className="text-sm text-muted-foreground">{formatSize(fileSize)}</p>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <button onClick={handleDownload} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="Download">
          <Download size={18} />
        </button>
        <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="Remove">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
