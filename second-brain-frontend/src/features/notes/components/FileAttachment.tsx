import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

interface FileAttachmentHandlerProps {
  onInsertHTML: (html: string) => void;
  onInsertImage: (src: string, alt?: string) => void;
  onPDFAttach: (dataUrl: string, fileName: string, fileSize: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// Convert a 2D array to a styled HTML table
const arrayToHTMLTable = (data: (string | number | null)[][], fileName: string): string => {
  if (data.length === 0) return '<p>Empty spreadsheet</p>';
  
  const headerRow = data[0];
  const bodyRows = data.slice(1);
  
  let html = `<div style="margin:1rem 0;overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.875rem;border:1px solid hsl(var(--border))">`;
  
  // Header
  html += '<thead><tr>';
  for (const cell of headerRow) {
    html += `<th style="padding:0.5rem 0.75rem;text-align:left;font-weight:700;border:1px solid hsl(var(--border));background:hsl(var(--accent)/0.5)">${cell ?? ''}</th>`;
  }
  html += '</tr></thead>';
  
  // Body rows
  html += '<tbody>';
  for (const row of bodyRows) {
    html += '<tr>';
    for (let i = 0; i < headerRow.length; i++) {
      const cell = row[i] ?? '';
      html += `<td style="padding:0.4rem 0.75rem;border:1px solid hsl(var(--border))">${cell}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  html += `<p style="font-size:0.7rem;color:hsl(var(--muted-foreground));margin-top:0.25rem">📊 Imported from ${fileName} · ${bodyRows.length} rows × ${headerRow.length} columns</p></div>`;
  
  return html;
};

export const useFileAttachment = ({ onInsertHTML, onInsertImage, onPDFAttach }: FileAttachmentHandlerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // ─── DOCX Parser ─────────────────────────────────────────────────────
  const processDocx = useCallback(async (file: File) => {
    try {
      toast.loading('Parsing DOCX file...', { id: 'docx-parse' });
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
          ],
        }
      );

      if (result.value) {
        onInsertHTML(result.value);
        toast.success(`Imported "${file.name}"`, { id: 'docx-parse' });
      } else {
        toast.error('Could not extract content from DOCX', { id: 'docx-parse' });
      }
    } catch (err) {
      console.error('DOCX parse error:', err);
      toast.error('Failed to parse DOCX file', { id: 'docx-parse' });
    }
  }, [onInsertHTML]);

  // ─── CSV Parser (native) ─────────────────────────────────────────────
  const processCSV = useCallback(async (file: File) => {
    try {
      toast.loading('Parsing CSV...', { id: 'csv-parse' });
      const text = await file.text();
      const rows = text.split('\n').filter(r => r.trim()).map(row => {
        // Handle quoted values with commas
        const cells: string[] = [];
        let current = '';
        let inQuote = false;
        for (const char of row) {
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            cells.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cells.push(current.trim());
        return cells;
      });

      const html = arrayToHTMLTable(rows, file.name);
      onInsertHTML(html);
      toast.success(`Imported "${file.name}" — ${rows.length - 1} rows`, { id: 'csv-parse' });
    } catch (err) {
      console.error('CSV parse error:', err);
      toast.error('Failed to parse CSV file', { id: 'csv-parse' });
    }
  }, [onInsertHTML]);

  // ─── Excel Parser (xlsx) ─────────────────────────────────────────────
  const processExcel = useCallback(async (file: File) => {
    try {
      toast.loading('Parsing Excel file...', { id: 'excel-parse' });
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Process each sheet
      let allHtml = '';
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, { header: 1 });
        
        if (jsonData.length === 0) continue;
        
        // Add sheet name header if multiple sheets
        if (workbook.SheetNames.length > 1) {
          allHtml += `<h3>📋 Sheet: ${sheetName}</h3>`;
        }
        allHtml += arrayToHTMLTable(jsonData, file.name);
      }

      if (allHtml) {
        onInsertHTML(allHtml);
        toast.success(`Imported "${file.name}" — ${workbook.SheetNames.length} sheet(s)`, { id: 'excel-parse' });
      } else {
        toast.error('No data found in Excel file', { id: 'excel-parse' });
      }
    } catch (err) {
      console.error('Excel parse error:', err);
      toast.error('Failed to parse Excel file', { id: 'excel-parse' });
    }
  }, [onInsertHTML]);

  // ─── Image Handler ───────────────────────────────────────────────────
  const processImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      onInsertImage(src, file.name);
      toast.success(`Image "${file.name}" inserted`);
    };
    reader.readAsDataURL(file);
  }, [onInsertImage]);

  // ─── PDF Handler ─────────────────────────────────────────────────────
  const processPDF = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onPDFAttach(dataUrl, file.name, file.size);
      toast.success(`PDF "${file.name}" attached`);
    };
    reader.readAsDataURL(file);
  }, [onPDFAttach]);

  // ─── Main File Router ────────────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const ext = file.name.toLowerCase().split('.').pop();
      const type = file.type;

      if (type.startsWith('image/')) {
        processImage(file);
      } else if (ext === 'pdf' || type === 'application/pdf') {
        processPDF(file);
      } else if (ext === 'docx' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        processDocx(file);
      } else if (ext === 'csv' || type === 'text/csv') {
        processCSV(file);
      } else if (ext === 'xlsx' || ext === 'xls' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || type === 'application/vnd.ms-excel') {
        processExcel(file);
      } else if (ext === 'txt') {
        // Plain text — insert as paragraphs
        file.text().then(text => {
          const html = text.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
          onInsertHTML(html);
          toast.success(`Inserted "${file.name}"`);
        });
      } else {
        // Generic file attachment badge
        onInsertHTML(`
          <div class="file-attachment-card" contenteditable="false">
            <div class="file-icon" style="background:#6366f1">📁</div>
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
          </div>
        `);
        toast.success(`File "${file.name}" attached`);
      }
    }
    if (e.target) e.target.value = '';
  }, [processImage, processPDF, processDocx, processCSV, processExcel, onInsertHTML]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    }
    if (e.target) e.target.value = '';
  }, [processImage]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openImagePicker = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  return { openFilePicker, openImagePicker, fileInputRef, imageInputRef, handleFileChange, handleImageChange };
};
