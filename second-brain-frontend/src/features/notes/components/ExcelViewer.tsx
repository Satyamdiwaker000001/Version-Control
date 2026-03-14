import { useState, useMemo } from 'react';
import { X, Maximize2, Download, Search, Table2, ChevronLeft, ChevronRight, FileSpreadsheet, Tabs, Tab } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import * as XLSX from 'xlsx';

interface ExcelViewerProps {
  dataUrl: string;
  fileName: string;
  fileSize: number;
  onClose?: () => void;
}

interface SheetData {
  name: string;
  data: (string | number | null)[][];
  headers: string[];
}

interface InlineViewerProps {
  expanded?: boolean;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  onClose?: () => void;
  onExpand: () => void;
  sheets: SheetData[];
  currentSheetIndex: number;
  onSheetChange: (index: number) => void;
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
  sheets,
  currentSheetIndex,
  onSheetChange
}: InlineViewerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const rowsPerPage = expanded ? 50 : 25;

  const currentSheet = sheets[currentSheetIndex];

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm || !currentSheet) return currentSheet.data;
    
    return currentSheet.data.filter(row =>
      row.some(cell => 
        cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [currentSheet, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (sortColumn === null || !currentSheet) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn] || '';
      const bValue = b[sortColumn] || '';
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, currentSheet]);

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

  const handleSheetChange = (index: number) => {
    onSheetChange(index);
    setCurrentPage(1);
    setSearchTerm('');
    setSortColumn(null);
    setSortDirection('asc');
  };

  if (!currentSheet) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
            <X size={14} className="text-red-500" />
          </div>
          <div className="text-sm text-red-500">No sheet data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "excel-viewer my-4 border rounded-lg bg-card text-card-foreground",
      expanded && "fixed inset-4 z-[400] bg-card shadow-2xl rounded-2xl flex flex-col"
    )}>
      <div className="excel-header flex items-center justify-between px-3 py-2 border-b border-border bg-accent/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <FileSpreadsheet size={14} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{fileName}</p>
            <p className="text-[10px] text-muted-foreground">{formatSize(fileSize)} · Excel · {sheets.length} sheet(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
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
            title="Download Excel"
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

      {/* Sheet Tabs */}
      {sheets.length > 1 && (
        <div className="flex items-center gap-1 p-2 border-b border-border bg-accent/20 overflow-x-auto">
          {sheets.map((sheet, index) => (
            <button
              key={index}
              onClick={() => handleSheetChange(index)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                currentSheetIndex === index
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

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
          {sortedData.length} of {currentSheet.data.length} rows
        </div>
      </div>

      {/* Table */}
      <div className={cn("flex-1 overflow-auto", expanded ? "p-4" : "p-2")}>
        <div className="min-w-full">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-accent/30 sticky top-0">
              <tr>
                {currentSheet.headers.map((header, index) => (
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
                  {currentSheet.headers.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-2 border border-border text-xs"
                    >
                      {row[colIndex] || ''}
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

export const ExcelViewer = ({ dataUrl, fileName, fileSize, onClose }: ExcelViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    const loadExcel = async () => {
      try {
        setLoading(true);
        const response = await fetch(dataUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        // Parse Excel file
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const parsedSheets: SheetData[] = workbook.SheetNames.map(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, { header: 1 });
          
          if (jsonData.length === 0) {
            return {
              name: sheetName,
              data: [],
              headers: []
            };
          }
          
          const headers = jsonData[0].map(header => header?.toString() || '');
          const data = jsonData.slice(1);
          
          return {
            name: sheetName,
            data,
            headers
          };
        }).filter(sheet => sheet.data.length > 0);
        
        setSheets(parsedSheets);
        setLoading(false);
      } catch (err) {
        setError('Failed to load Excel file');
        setLoading(false);
      }
    };

    loadExcel();
  }, [dataUrl]);

  if (loading) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <FileSpreadsheet size={14} className="text-emerald-500" />
          </div>
          <div className="text-sm">Loading Excel...</div>
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

  if (sheets.length === 0) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <FileSpreadsheet size={14} className="text-yellow-500" />
          </div>
          <div className="text-sm text-yellow-500">No data found in Excel file</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <InlineViewer 
        dataUrl={dataUrl}
        fileName={fileName}
        fileSize={fileSize}
        onClose={onClose}
        onExpand={() => setIsExpanded(!isExpanded)}
        sheets={sheets}
        currentSheetIndex={currentSheetIndex}
        onSheetChange={setCurrentSheetIndex}
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
        sheets={sheets}
        currentSheetIndex={currentSheetIndex}
        onSheetChange={setCurrentSheetIndex}
      />}
    </>
  );
};
