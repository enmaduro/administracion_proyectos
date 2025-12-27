import React, { useEffect, useState, useRef } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import { ChatEntry } from '../types';

interface ChatHistoryModalProps {
  history: ChatEntry[];
  onClose: () => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ history, onClose, onSendMessage, isLoading }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="bg-indigo-500 text-white p-1 rounded-md">AI</span> Asistente del Proyecto
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {history.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p>¡Hola! Soy tu asistente virtual.</p>
              <p>Pregúntame sobre tus gastos, presupuesto o facturas.</p>
            </div>
          ) : (
            history.map((entry, index) => (
              <div key={entry.id || index} className={`flex items-start gap-3 ${entry.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {entry.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-1">
                    AI
                  </div>
                )}
                <div className="relative group max-w-[80%]">
                  <div className={`p-3 rounded-2xl px-4 shadow-sm ${entry.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                    }`}>
                    <p className="text-sm dark:text-gray-300 font-semibold mb-1 opacity-80 text-xs">
                      {entry.sender === 'user' ? 'Tú' : 'Asistente AI'} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                  </div>
                  {entry.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(entry.text, index)}
                      className={`absolute -bottom-8 left-0 p-1 rounded-md transition-all ${copiedIndex === index ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Copiar respuesta"
                    >
                      {copiedIndex === index ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  )}
                </div>
                {entry.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-1">
                    Tú
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-1 animate-pulse">AI</div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu pregunta sobre el proyecto..."
              className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`px-6 py-3 rounded-full font-semibold text-white transition-all shadow-md flex items-center gap-2
                        ${isLoading || !inputValue.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
            >
              <span>Enviar</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            La IA puede cometer errores. Verifica los datos importantes en el reporte.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatHistoryModal;