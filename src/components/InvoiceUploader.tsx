// src/components/InvoiceUploader.tsx
import React, { useState, useRef, useCallback } from 'react';

interface Props {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: { message: string; duplicateInvoiceId?: string } | null;
  onErrorDismiss: () => void;
}

const InvoiceUploader: React.FC<Props> = ({ onFileUpload, isLoading, error, onErrorDismiss }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      const items = e.dataTransfer.items;
      if (items.length > 0) {
        const item = items[0];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          // ✅ Validar imagen o PDF
          if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            setIsDragActive(true);
          } else {
            setIsDragActive(false);
          }
        }
      }
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // ✅ Validar tipo de archivo
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert("Por favor, sube solo archivos de imagen (JPG, PNG) o PDF.");
      }
    }
  }, [onFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // ✅ Validar tipo de archivo
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert("Por favor, sube solo archivos de imagen (JPG, PNG) o PDF.");
      }
    }
  }, [onFileUpload]);

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/*,application/pdf" // ✅ Imágenes y PDF
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            <span className="font-medium text-blue-600 dark:text-blue-400">Clic aquí</span> o arrastra una factura (imagen o PDF)
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Formatos soportados: JPG, PNG, PDF
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-700 dark:text-gray-300">Procesando factura...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p>{error.message}</p>
            {error.duplicateInvoiceId && (
              <button
                onClick={onErrorDismiss}
                className="mt-2 text-sm underline text-red-600 dark:text-red-400 hover:no-underline"
              >
                Aceptar y continuar
              </button>
            )}
          </div>
          {!error.duplicateInvoiceId && (
            <button
              onClick={onErrorDismiss}
              className="ml-auto text-sm p-1 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 rounded-full"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceUploader;