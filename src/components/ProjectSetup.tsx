import React, { useState } from 'react';
import { ProjectInfo } from '../types';

interface ProjectSetupProps {
  onProjectSubmit: (info: ProjectInfo) => void;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({ onProjectSubmit }) => {
  const [communityName, setCommunityName] = useState('');
  const [consultationNumber, setConsultationNumber] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [budget, setBudget] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (communityName && consultationNumber && year) {
      onProjectSubmit({
        communityName,
        consultationNumber,
        year,
        budget: budget ? parseFloat(budget) : undefined,
        geminiApiKey: apiKey.trim() || undefined
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Configuración del Proyecto
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Ingrese los detalles para comenzar a gestionar los gastos.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="communityName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la Comuna o Consejo Comunal
            </label>
            <input
              type="text"
              id="communityName"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Ej: Comuna El Despertar"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="consultationNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nro. de Consulta
              </label>
              <input
                type="text"
                id="consultationNumber"
                value={consultationNumber}
                onChange={(e) => setConsultationNumber(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Ej: 001-2024"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Año
              </label>
              <input
                type="text"
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Ej: 2024"
              />
            </div>
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Presupuesto Inicial (Opcional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                Bs.
              </span>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tu Clave de API de Gemini (Opcional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Si la dejas en blanco, se usará la clave compartida de la aplicación.
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Obtener mi clave gratis aquí
              </a>.
            </p>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Pegue su clave aquí (comienza con AIza...)"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-transform transform hover:scale-105"
          >
            Iniciar Proyecto
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectSetup;