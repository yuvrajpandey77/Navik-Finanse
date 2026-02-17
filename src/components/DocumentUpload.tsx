import { Upload, FileText, X } from 'lucide-react';
import { useState } from 'react';

interface DocumentUploadProps {
  onDocumentUpload: (filename: string, content: string) => void;
  uploadedDocs: Array<{ filename: string; content: string }>;
  onRemoveDoc: (filename: string) => void;
}

export function DocumentUpload({ onDocumentUpload, uploadedDocs, onRemoveDoc }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onDocumentUpload(file.name, content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      handleFileRead(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-white'
        }`}
      >
        <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
        <p className="mt-2 text-sm text-gray-600">Drag and drop a document here, or</p>
        <label className="mt-2 inline-block">
          <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">
            Browse Files
          </span>
          <input
            type="file"
            className="hidden"
            accept=".txt"
            onChange={handleFileInput}
          />
        </label>
        <p className="mt-2 text-xs text-gray-500">Supports .txt files</p>
      </div>

      {uploadedDocs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Uploaded Documents:</h3>
          {uploadedDocs.map((doc) => (
            <div
              key={doc.filename}
              className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-700">{doc.filename}</span>
              </div>
              <button
                onClick={() => onRemoveDoc(doc.filename)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
