import React, { useEffect } from 'react';
import { HistoryEntry } from '../types.ts';

interface HistoryLogModalProps {
  history: HistoryEntry[];
  onClose: () => void;
}

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const HistoryLogModal: React.FC<HistoryLogModalProps> = ({ history, onClose }) => {
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
      className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Historial de Actividad
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            aria-label="Cerrar historial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {history.length > 0 ? (
            history.map(entry => (
              <div key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-800 dark:text-gray-200">{entry.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimestamp(entry.timestamp)}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Aún no hay actividad registrada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryLogModal;