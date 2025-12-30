// src/Aplicacion.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ProjectMetadata } from './types';
// Si NO creaste la carpeta hooks, usa: import { usePersistentState } from './hooks/usePersistentState';
import { usePersistentState } from './hooks/usePersistentState'; 
import ProjectList from './components/ProjectList';
import ProjectDashboard from './components/ProjectDashboard';
import RegistrationModal from './components/RegistrationModal';

const App: React.FC = () => {
    // Enlace de Google Forms
    const REGISTRATION_LINK = "https://forms.gle/QhctRTkCTTaQqH6p7";

    // Lista de Proyectos
    const [projects, setProjects] = usePersistentState<ProjectMetadata[]>('projects-list', []);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    // Control de Registro (Portero)
    const [hasRegistered, setHasRegistered] = usePersistentState('gastos_app_registered', false);

    // Migración de datos antiguos (Lógica existente, se mantiene igual)
    useEffect(() => {
        const migrateData = () => {
            const oldProjectInfo = window.localStorage.getItem('project-info');
            if (oldProjectInfo && projects.length === 0) {
                console.log("Detectados datos antiguos. Iniciando migración...");
                const defaultId = 'default-project';
                const now = new Date().toISOString();

                const newProject: ProjectMetadata = {
                    id: defaultId,
                    name: 'Proyecto Principal (Migrado)',
                    createdAt: now,
                    lastAccessed: now,
                };

                const keysToMigrate = [
                    { old: 'project-info', new: `project-${defaultId}-info` },
                    { old: 'project-invoices', new: `project-${defaultId}-invoices` },
                    { old: 'project-phases', new: `project-${defaultId}-phases` },
                    { old: 'project-history', new: `project-${defaultId}-history` },
                ];

                keysToMigrate.forEach(({ old, new: newKey }) => {
                    const data = window.localStorage.getItem(old);
                    if (data) {
                        window.localStorage.setItem(newKey, data);
                        window.localStorage.removeItem(old);
                    }
                });

                setProjects([newProject]);
                setActiveProjectId(defaultId);
                console.log("Migración completada.");
            }
        };

        migrateData();
    }, [projects, setProjects]);

    const handleCreateProject = (name: string) => {
        const newProject: ProjectMetadata = {
            id: Date.now().toString(),
            name,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
        };
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
    };

    const handleSelectProject = (projectId: string) => {
        setActiveProjectId(projectId);
        setProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, lastAccessed: new Date().toISOString() } : p
        ));
    };

    const handleDeleteProject = (projectId: string) => {
        const keysToDelete = [
            `project-${projectId}-info`,
            `project-${projectId}-invoices`,
            `project-${projectId}-phases`,
            `project-${projectId}-history`,
        ];
        keysToDelete.forEach(key => window.localStorage.removeItem(key));

        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (activeProjectId === projectId) {
            setActiveProjectId(null);
        }
    };

    const handleBackToProjects = () => {
        setActiveProjectId(null);
    };

    // --- EL PORTERO ---
    // Si no se ha registrado, mostramos el modal y bloqueamos el resto
    if (!hasRegistered) {
        return <RegistrationModal registrationLink={REGISTRATION_LINK} onComplete={() => setHasRegistered(true)} />;
    }

    // --- APLICACIÓN NORMAL ---
    return (
        <div className="min-h-screen bg-background">
            {activeProjectId ? (
                <ProjectDashboard
                    key={activeProjectId}
                    activeProjectId={activeProjectId}
                    onBack={handleBackToProjects}
                />
            ) : (
                <ProjectList
                    projects={projects}
                    onSelectProject={handleSelectProject}
                    onCreateProject={handleCreateProject}
                    onDeleteProject={handleDeleteProject}
                />
            )}
        </div>
    );
};

export default App;