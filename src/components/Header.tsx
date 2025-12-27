import React from 'react';
import { ProjectInfo } from '../types';
import { ResetIcon, HistoryIcon, FolderIcon, DownloadIcon, UploadIcon } from './icons';

interface HeaderProps {
  projectInfo: ProjectInfo;
  onShowSummary: () => void;
  onShowHistory: () => void;
  // onShowChatHistory: () => void; // Removed
  onResetProject: () => void;
  onBack: () => void;
  onExport: () => void;
  onImport: () => void;

  onShowBudget: () => void;
  onShowInvoices: () => void;
  activeView: 'invoices' | 'budget';
  // onConfigure: () => void; // Removed
}

const Header: React.FC<HeaderProps> = ({
  projectInfo,
  onShowSummary,
  onShowHistory,
  onResetProject,
  onBack,
  onExport,
  onImport,
  onShowBudget,
  onShowInvoices,
  activeView
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="mb-2 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
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
              onClick={onBack}
              className="flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 transition-colors"
              title="Volver a la lista de proyectos"
            >
              <FolderIcon />
              Cambiar Proyecto
            </button>
            <button
              onClick={onShowSummary}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
            >
              Ver Resumen
            </button>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
              <button
                onClick={onShowInvoices}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeView === 'invoices'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                Facturas
              </button>
              <button
                onClick={onShowBudget}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeView === 'budget'
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                Presupuesto Base
              </button>
            </div>

            <button
              onClick={onShowHistory}
              className="flex items-center px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors"
              title="Ver historial de actividad del proyecto"
            >
              <HistoryIcon />
              <span className="ml-2">Historial</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <button
              onClick={onExport}
              className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-colors"
              title="Exportar respaldo completo del proyecto (JSON)"
            >
              <DownloadIcon />
              <span className="ml-2">Respaldar</span>
            </button>
            <button
              onClick={onImport}
              className="flex items-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 transition-colors"
              title="Restaurar datos desde un respaldo"
            >
              <UploadIcon />
              <span className="ml-2">Restaurar</span>
            </button>
            <button
              onClick={onResetProject}
              className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-colors"
              title="Borra todos los datos y comienza un nuevo proyecto"
            >
              <ResetIcon />
              <span className="ml-2">Reiniciar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;