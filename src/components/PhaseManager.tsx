import React, { useState } from 'react';
import { Phase } from '@/types';
import { PlusIcon } from './icons';

interface PhaseManagerProps {
  phases: Phase[];
  activePhaseId: string | null;
  onSelectPhase: (phaseId: string | null) => void;
  onAddPhase: (phaseName: string) => void;
}

const PhaseManager: React.FC<PhaseManagerProps> = ({ phases, activePhaseId, onSelectPhase, onAddPhase }) => {
  const [newPhaseName, setNewPhaseName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhaseName.trim()) {
      onAddPhase(newPhaseName.trim());
      setNewPhaseName('');
      setIsAdding(false);
    }
  };

  const baseTabClasses = "px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap";
  const activeTabClasses = "bg-blue-600 text-white shadow";
  const inactiveTabClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

  // Comprobación defensiva: Asegura que 'phases' sea siempre un array para evitar errores.
  const validPhases = Array.isArray(phases) ? phases : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold mr-2 shrink-0">Fases del Proyecto:</h3>
        <div className="flex-grow flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectPhase(null)}
            className={`${baseTabClasses} ${activePhaseId === null ? activeTabClasses : inactiveTabClasses}`}
          >
            Todas
          </button>
          {validPhases.map(phase => (
            <button
              key={phase.id}
              onClick={() => onSelectPhase(phase.id)}
              className={`${baseTabClasses} ${activePhaseId === phase.id ? activeTabClasses : inactiveTabClasses}`}
            >
              {phase.name}
            </button>
          ))}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium"
            >
              <PlusIcon />
              Añadir Fase
            </button>
          ) : (
            <form onSubmit={handleAddPhase} className="flex items-center gap-2">
              <input
                type="text"
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                placeholder="Nombre de la nueva fase"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm w-40"
                autoFocus
                onBlur={() => { if (!newPhaseName) setIsAdding(false) }}
              />
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">Guardar</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">Cancelar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhaseManager;