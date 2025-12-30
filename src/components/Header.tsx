import React from 'react';
import { ProjectInfo } from '@/types';
import { ResetIcon, HistoryIcon, FolderIcon, DownloadIcon, UploadIcon } from './icons';

interface HeaderProps {
  projectInfo: ProjectInfo;
  onShowSummary: () => void;
  onShowHistory: () => void;
  onResetProject: () => void;
  onBack: () => void;
  onExport: () => void;
  onImport: () => void;
  onShowBudget: () => void;
  onShowInvoices: () => void;
  activeView: 'invoices' | 'budget';
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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Izquierda: Título y Badge */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Gestor de Gastos
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {projectInfo.communityName}
              </p>
            </div>
            {/* Badge del Proyecto */}
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {projectInfo.consultationNumber} / {projectInfo.year}
              </span>
            </div>
          </div>

          {/* Derecha: Controles */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            
            {/* Botón Volver */}
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
              title="Cambiar Proyecto"
            >
              <FolderIcon />
              <span className="ml-2 hidden sm:inline">Cambiar</span>
            </button>

            {/* Switch de Vistas (Tabs) */}
            <div className="flex bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
              <button
                onClick={onShowInvoices}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeView === 'invoices'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                Facturas
              </button>
              <button
                onClick={onShowBudget}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeView === 'budget'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                Presupuesto
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-1"></div>

            {/* Acciones de Datos */}
            <button
              onClick={onShowSummary}
              className="flex items-center px-3 py-2 bg-secondary-500 text-white font-medium rounded-lg hover:bg-secondary-600 transition-all text-sm shadow-md shadow-secondary-500/20"
            >
              <span className="hidden sm:inline">Resumen</span>
            </button>

            <button
              onClick={onShowHistory}
              className="flex items-center px-3 py-2 bg-slate-500 text-white font-medium rounded-lg hover:bg-slate-600 transition-all text-sm"
              title="Historial"
            >
              <HistoryIcon />
            </button>

            <button
              onClick={onExport}
              className="flex items-center px-3 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all text-sm shadow-md shadow-primary-500/20"
              title="Respaldar"
            >
              <DownloadIcon />
              <span className="ml-2 hidden sm:inline">Respaldar</span>
            </button>

            <button
              onClick={onImport}
              className="flex items-center px-3 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all text-sm"
              title="Restaurar"
            >
              <UploadIcon />
              <span className="ml-2 hidden sm:inline">Restaurar</span>
            </button>

            <button
              onClick={onResetProject}
              className="flex items-center px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all text-sm border border-red-100 dark:border-red-900"
              title="Reiniciar Proyecto"
            >
              <ResetIcon />
              <span className="ml-2 hidden sm:inline">Reiniciar</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;