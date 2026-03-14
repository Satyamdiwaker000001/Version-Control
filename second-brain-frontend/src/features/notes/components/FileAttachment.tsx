import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import mammoth from 'mammoth';

interface FileAttachmentHandlerProps {
  onInsertHTML: (html: string) => void;
  onInsertImage: (src: string, alt?: string) => void;
  onPDFAttach: (dataUrl: string, fileName: string, fileSize: number) => void;
  onCSVAttach: (dataUrl: string, fileName: string, fileSize: number) => void;
  onExcelAttach: (dataUrl: string, fileName: string, fileSize: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const useFileAttachment = ({ onInsertHTML, onInsertImage, onPDFAttach, onCSVAttach, onExcelAttach }: FileAttachmentHandlerProps) => {
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
      toast.loading('Loading CSV file...', { id: 'csv-parse' });
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onCSVAttach(dataUrl, file.name, file.size);
        toast.success(`CSV "${file.name}" attached`, { id: 'csv-parse' });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('CSV parse error:', err);
      toast.error('Failed to load CSV file', { id: 'csv-parse' });
    }
  }, [onCSVAttach]);

  // ─── Excel Parser (xlsx) ─────────────────────────────────────────────
  const processExcel = useCallback(async (file: File) => {
    try {
      toast.loading('Loading Excel file...', { id: 'excel-parse' });
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onExcelAttach(dataUrl, file.name, file.size);
        toast.success(`Excel "${file.name}" attached`, { id: 'excel-parse' });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Excel parse error:', err);
      toast.error('Failed to load Excel file', { id: 'excel-parse' });
    }
  }, [onExcelAttach]);

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
