import { useState } from 'react';
import { CSVViewer } from './CSVViewer';
import { ExcelViewer } from './ExcelViewer';
import { PDFViewer } from './PDFViewer';
import { FileCommentSection } from './FileCommentSection';

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface FileViewerWithCommentsProps {
  fileType: 'csv' | 'excel' | 'pdf';
  dataUrl: string;
  fileName: string;
  fileSize: number;
  onClose?: () => void;
  initialComments?: Comment[];
}

export const FileViewerWithComments = ({ 
  fileType, 
  dataUrl, 
  fileName, 
  fileSize, 
  onClose,
  initialComments = []
}: FileViewerWithCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        id: 'current-user',
        name: 'You',
        avatar: ''
      },
      content,
      timestamp: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  };

  const renderFileViewer = () => {
    const commonProps = {
      dataUrl,
      fileName,
      fileSize,
      onClose
    };

    switch (fileType) {
      case 'csv':
        return <CSVViewer {...commonProps} />;
      case 'excel':
        return <ExcelViewer {...commonProps} />;
      case 'pdf':
        return <PDFViewer {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1">
        {renderFileViewer()}
      </div>
      
      <div className="w-80 h-full">
        <FileCommentSection
          comments={comments}
          onAddComment={handleAddComment}
          fileName={fileName}
          isExpanded={commentsExpanded}
          onToggleExpand={() => setCommentsExpanded(!commentsExpanded)}
          onClose={() => setCommentsExpanded(false)}
        />
      </div>
      
      {commentsExpanded && (
        <FileCommentSection
          comments={comments}
          onAddComment={handleAddComment}
          fileName={fileName}
          isExpanded={commentsExpanded}
          onToggleExpand={() => setCommentsExpanded(!commentsExpanded)}
          onClose={() => setCommentsExpanded(false)}
        />
      )}
    </div>
  );
};
