// Aplicacion.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ProjectMetadata } from './types';
import ProjectList from './components/ProjectList';
import ProjectDashboard from './components/ProjectDashboard';

// Hook personalizado para manejar el estado que persiste en localStorage.
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

const App: React.FC = () => {
  const [projects, setProjects] = usePersistentState<ProjectMetadata[]>('projects-list', []);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Migración de datos antiguos (Single Project -> Multi Project)
  useEffect(() => {
    const migrateData = () => {
      const oldProjectInfo = window.localStorage.getItem('project-info');
      if (oldProjectInfo && projects.length === 0) {
        console.log("Detectados datos antiguos. Iniciando migración...");
        const defaultId = 'default-project';
        const now = new Date().toISOString();

        // Crear metadatos del proyecto
        const newProject: ProjectMetadata = {
          id: defaultId,
          name: 'Proyecto Principal (Migrado)',
          createdAt: now,
          lastAccessed: now,
        };

        // Migrar datos a las nuevas claves
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
            window.localStorage.removeItem(old); // Limpiar datos antiguos
          }
        });

        // Actualizar estado
        setProjects([newProject]);
        // Opcional: Auto-seleccionar el proyecto migrado
        // setActiveProjectId(defaultId); 
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
    // Actualizar lastAccessed
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, lastAccessed: new Date().toISOString() } : p
    ));
  };

  const handleDeleteProject = (projectId: string) => {
    // Eliminar datos del localStorage
    const keysToDelete = [
      `project-${projectId}-info`,
      `project-${projectId}-invoices`,
      `project-${projectId}-phases`,
      `project-${projectId}-history`,
    ];
    keysToDelete.forEach(key => window.localStorage.removeItem(key));

    // Eliminar de la lista
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const handleBackToProjects = () => {
    setActiveProjectId(null);
  };

  if (activeProjectId) {
    return (
      <ProjectDashboard
        projectId={activeProjectId}
        onBack={handleBackToProjects}
      />
    );
  }

  return (
    <ProjectList
      projects={projects}
      onSelectProject={handleSelectProject}
      onCreateProject={handleCreateProject}
      onDeleteProject={handleDeleteProject}
    />
  );
};

export default App;