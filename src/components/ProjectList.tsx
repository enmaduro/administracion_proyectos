// src/components/ProjectList.tsx
import React, { useState } from 'react';
import { ProjectMetadata } from '../types';

interface ProjectListProps {
    projects: ProjectMetadata[];
    onSelectProject: (projectId: string) => void;
    onCreateProject: (name: string) => void;
    onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, onCreateProject, onDeleteProject }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectName.trim()) {
            onCreateProject(newProjectName.trim());
            setNewProjectName('');
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                    Mis Proyectos
                </h1>

                {projects.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mb-8">
                        <p>No tienes proyectos creados.</p>
                        <p>¡Crea uno para comenzar a gestionar tus gastos!</p>
                    </div>
                ) : (
                    <ul className="space-y-3 mb-8">
                        {projects.map((project) => (
                            <li key={project.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
                                <button
                                    onClick={() => onSelectProject(project.id)}
                                    className="flex-grow text-left"
                                >
                                    <span className="font-semibold text-gray-800 dark:text-white block">
                                        {project.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Último acceso: {new Date(project.lastAccessed).toLocaleDateString()}
                                    </span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`¿Estás seguro de eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`)) {
                                            onDeleteProject(project.id);
                                        }
                                    }}
                                    className="ml-4 text-red-500 hover:text-red-700 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                    title="Eliminar proyecto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {isCreating ? (
                    <form onSubmit={handleCreateSubmit} className="mb-4">
                        <div className="mb-4">
                            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre del Proyecto
                            </label>
                            <input
                                type="text"
                                id="projectName"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Ej. Consulta Popular 2024"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Crear
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Crear Nuevo Proyecto
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
