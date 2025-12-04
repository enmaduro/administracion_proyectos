import React, { useEffect, useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface ChatHistoryModalProps {
  onClose: () => void;
}

const conversationHistory = [
  {
    sender: 'user',
    text: 'Necesito una aplicación o CRM, moderno e intuitivo, que me permita crear un proyecto y a este proyecto ir agregándole fases.',
  },
  {
    sender: 'assistant',
    text: '¡Entendido! He solucionado un problema inicial que mostraba una pantalla en blanco y he ajustado la gestión de la clave de API. Ahora la aplicación debería iniciarse correctamente para que puedas configurar tu proyecto.',
  },
  {
    sender: 'user',
    text: 'No veo el historial de la conversación.',
  },
  {
    sender: 'assistant',
    text: '¡Claro! He añadido un panel de "Historial de Actividad" para que puedas ver todas las acciones realizadas en tu proyecto, como la creación de fases y la carga de facturas.',
  },
  {
    sender: 'user',
    text: 'Disculpa, no me expliqué. Me refiero al historial de este chat, para la elaboración de la app.',
  },
  {
    sender: 'assistant',
    text: '¡Ah, comprendido! He añadido este mismo historial de conversación en una ventana para que puedas consultar cómo hemos construido la aplicación juntos.',
  },
];

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000); // El estado de "copiado" dura 2 segundos
    }).catch(err => {
      console.error('Error al copiar texto: ', err);
      alert('No se pudo copiar el texto.');
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Historial de la Conversación con el Asistente
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

        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
          {conversationHistory.map((entry, index) => (
            <div key={index} className={`flex items-start gap-3 ${entry.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {entry.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  IA
                </div>
              )}
              <div className="relative group max-w-md">
                <div className={`p-3 rounded-lg ${entry.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                    <p className="font-bold text-sm mb-1">{entry.sender === 'user' ? 'Tú' : 'Asistente'}</p>
                    <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                </div>
                <button
                    onClick={() => handleCopy(entry.text, index)}
                    title={copiedIndex === index ? 'Copiado' : 'Copiar texto'}
                    className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200
                                ${copiedIndex === index 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-500 bg-opacity-20 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-opacity-40'}`
                                }
                >
                    {copiedIndex === index ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
               {entry.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  Tú
                </div>
              )}
            </div>
          ))}
        </div>
         <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
             <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
            >
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;