import React from 'react';
import { ProjectInfo } from '../types.ts';
import { ResetIcon, HistoryIcon, ChatHistoryIcon } from './icons.tsx';

interface HeaderProps {
  projectInfo: ProjectInfo;
  onShowSummary: () => void;
  onShowHistory: () => void;
  onShowChatHistory: () => void;
  onResetProject: () => void;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ projectInfo, onShowSummary, onShowHistory, onShowChatHistory, onResetProject, onBack }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="mb-2 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Volver a la lista de proyectos"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              Gestor de Gastos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {projectInfo.communityName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <strong>Proyecto:</strong> {projectInfo.consultationNumber} / {projectInfo.year}
            </div>
            <button
              onClick={onShowSummary}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
            >
              Ver Resumen
            </button>
            <button
              onClick={onShowHistory}
              className="flex items-center px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors"
              title="Ver historial de actividad del proyecto"
            >
              <HistoryIcon />
              <span className="ml-2">Historial</span>
            </button>
            <button
              onClick={onShowChatHistory}
              className="flex items-center px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition-colors"
              title="Ver historial de la conversación con el asistente"
            >
              <ChatHistoryIcon />
              <span className="ml-2">Asistente IA</span>
            </button>
            <button
              onClick={onResetProject}
              className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-colors"
              title="Borra todos los datos y comienza un nuevo proyecto"
            >
              <ResetIcon />
              Reiniciar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;