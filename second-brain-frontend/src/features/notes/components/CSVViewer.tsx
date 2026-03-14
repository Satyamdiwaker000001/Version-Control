import { useState, useMemo, useEffect } from 'react';
import { X, Maximize2, Download, Search, Table2, ChevronLeft, ChevronRight, Edit3, Save } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';
import { CollaborationPanel } from './CollaborationPanel';
import { useCollaboration } from '../hooks/useCollaboration';

interface CSVViewerProps {
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
  headers: string[];
  filteredData: string[][];
  isEditing: boolean;
  onToggleEdit: () => void;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onCellEdit: (rowIndex: number, colIndex: number, value: string) => void;
  editingCell: {row: number, col: number} | null;
  editValue: string;
  onCellChange: (value: string) => void;
  onCellBlur: () => void;
  onCellKeyPress: (e: React.KeyboardEvent) => void;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const InlineViewer = ({ 
  expanded = false, 
  dataUrl, 
  fileName, 
  fileSize, 
  onClose, 
  onExpand, 
  headers, 
  filteredData,
  isEditing,
  onToggleEdit,
  hasUnsavedChanges,
  onSave,
  onCellEdit,
  editingCell,
  editValue,
  onCellChange,
  onCellBlur,
  onCellKeyPress
}: InlineViewerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const rowsPerPage = expanded ? 50 : 25;

  // Filter data based on search
  const displayData = useMemo(() => {
    if (!searchTerm) return filteredData;
    
    return filteredData.filter(row =>
      row.some(cell => 
        cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [filteredData, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (sortColumn === null) return displayData;
    
    return [...displayData].sort((a, b) => {
      const aValue = a[sortColumn] || '';
      const bValue = b[sortColumn] || '';
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [displayData, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={cn(
      "csv-viewer my-4 border rounded-lg bg-card text-card-foreground",
      expanded && "fixed inset-4 z-[400] bg-card shadow-2xl rounded-2xl flex flex-col"
    )}>
      <div className="csv-header flex items-center justify-between px-3 py-2 border-b border-border bg-accent/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Table2 size={14} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{fileName}</p>
            <p className="text-[10px] text-muted-foreground">{formatSize(fileSize)} · CSV · {filteredData.length} rows {hasUnsavedChanges && '· Unsaved changes'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasUnsavedChanges && (
            <button
              onClick={onSave}
              className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Save changes"
            >
              <Save size={14} />
            </button>
          )}
          <button
            onClick={onToggleEdit}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              isEditing ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            title={isEditing ? "Disable editing" : "Enable editing"}
          >
            <Edit3 size={14} />
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
            title="Download CSV"
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

      {/* Search and Controls */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-accent/20">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search table..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-8 pr-2 py-1 text-sm border rounded-md bg-background"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {sortedData.length} of {filteredData.length} rows
        </div>
      </div>

      {/* Table */}
      <div className={cn("flex-1 overflow-auto", expanded ? "p-4" : "p-2")}>
        <div className="min-w-full">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-accent/30 sticky top-0">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    onClick={() => handleSort(index)}
                    className="p-2 text-left font-semibold border border-border cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{header || `Column ${index + 1}`}</span>
                      {sortColumn === index && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-accent/20">
                  {headers.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        "p-2 border border-border text-xs",
                        isEditing && "cursor-pointer hover:bg-accent/50"
                      )}
                      onClick={() => isEditing && onCellEdit(rowIndex, colIndex, row[colIndex] || '')}
                    >
                      {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => onCellChange(e.target.value)}
                          onBlur={onCellBlur}
                          onKeyDown={onCellKeyPress}
                          className="w-full px-1 py-0.5 text-xs border border-blue-400 rounded outline-none"
                          autoFocus
                        />
                      ) : (
                        row[colIndex] || ''
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-accent/20">
          <div className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs px-2">
              {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CSVViewer = ({ dataUrl, fileName, fileSize, onClose }: CSVViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize collaboration
  const collaboration = useCollaboration({
    userId: 'current-user',
    userName: 'You'
  });

  // Load and parse CSV data
  useEffect(() => {
    const loadCSV = async () => {
      try {
        setLoading(true);
        const response = await fetch(dataUrl);
        const text = await response.text();
        
        // Parse CSV with proper handling of quotes and commas
        const lines = text.split('\n').filter(line => line.trim());
        const parsedData = lines.map(line => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        });
        
        if (parsedData.length > 0) {
          setHeaders(parsedData[0]);
          setData(parsedData.slice(1));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load CSV file');
        setLoading(false);
      }
    };

    loadCSV();
  }, [dataUrl]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
      return () => clearTimeout(timer);
    }
  }, [data, hasUnsavedChanges]);

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    setEditingCell({row: rowIndex, col: colIndex});
    setEditValue(value);
    setIsEditing(true);
    
    // Send collaboration notification
    collaboration.sendCellEdit(rowIndex, colIndex, value);
  };

  const handleCellChange = (value: string) => {
    setEditValue(value);
  };

  const handleCellBlur = () => {
    if (editingCell && editValue !== data[editingCell.row][editingCell.col]) {
      const newData = [...data];
      newData[editingCell.row][editingCell.col] = editValue;
      setData(newData);
      setHasUnsavedChanges(true);
    }
    setIsEditing(false);
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleSave = () => {
    // Convert data back to CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited_${fileName}`;
    a.click();
    URL.revokeObjectURL(url);
    
    setHasUnsavedChanges(false);
    toast.success('Changes saved successfully');
  };

  if (loading) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Table2 size={14} className="text-green-500" />
          </div>
          <div className="text-sm">Loading CSV...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
            <X size={14} className="text-red-500" />
          </div>
          <div className="text-sm text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1">
        <InlineViewer 
          dataUrl={dataUrl}
          fileName={fileName}
          fileSize={fileSize}
          onClose={onClose}
          onExpand={() => setIsExpanded(!isExpanded)}
          headers={headers}
          filteredData={data}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          onCellEdit={handleCellEdit}
          editingCell={editingCell}
          editValue={editValue}
          onCellChange={handleCellChange}
          onCellBlur={handleCellBlur}
          onCellKeyPress={handleKeyPress}
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
          headers={headers}
          filteredData={data}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          onCellEdit={handleCellEdit}
          editingCell={editingCell}
          editValue={editValue}
          onCellChange={handleCellChange}
          onCellBlur={handleCellBlur}
          onCellKeyPress={handleKeyPress}
        />}
      </div>
      
      <CollaborationPanel
        fileName={fileName}
        currentUser={collaboration.currentUser}
        onlineUsers={collaboration.onlineUsers}
        messages={collaboration.messages}
        onSendMessage={collaboration.sendMessage}
        isLiveMode={collaboration.isLiveMode}
        onToggleLiveMode={collaboration.toggleLiveMode}
        connectionStatus={collaboration.connectionStatus}
      />
    </div>
  );
};
