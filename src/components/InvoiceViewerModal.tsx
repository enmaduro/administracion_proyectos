import React, { useEffect } from 'react';
import { Invoice } from '@/types';

interface InvoiceViewerModalProps {
  invoice: Invoice;
  onClose: () => void;
}

const InvoiceViewerModal: React.FC<InvoiceViewerModalProps> = ({ invoice, onClose }) => {

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
            Visualizando: {invoice.fileName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-grow overflow-auto">
          {invoice.fileType.startsWith('image/') ? (
            <img src={invoice.fileDataUrl} alt="Vista previa de la factura" className="max-w-full max-h-full mx-auto object-contain" />
          ) : invoice.fileType === 'application/pdf' ? (
            <embed src={invoice.fileDataUrl} type="application/pdf" className="w-full h-[75vh]" />
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600 dark:text-gray-300">No se puede previsualizar este tipo de archivo ({invoice.fileType}).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewerModal;