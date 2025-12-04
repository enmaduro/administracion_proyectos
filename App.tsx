import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ProjectInfo, Invoice, Phase, HistoryEntry } from './types';
import ProjectSetup from './components/ProjectSetup';
import Header from './components/Header';
import InvoiceUploader from './components/InvoiceUploader';
import InvoicesTable from './components/InvoicesTable';
import { extractInvoiceData } from './services/geminiService';
import InvoiceViewerModal from './components/InvoiceViewerModal';
import PhaseManager from './components/PhaseManager';
import SummaryReportModal from './components/SummaryReportModal';
import HistoryLogModal from './components/HistoryLogModal';
import ChatHistoryModal from '/components/ChatHistoryModal.tsx';

// Hook personalizado para manejar el estado que persiste en localStorage.
// Al usarlo, cualquier cambio en el estado se guarda automáticamente.
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
  const [projectInfo, setProjectInfo] = usePersistentState<ProjectInfo | null>('project-info', null);
  const [invoices, setInvoices] = usePersistentState<Invoice[]>('project-invoices', []);
  const [phases, setPhases] = usePersistentState<Phase[]>('project-phases', []);
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('project-history', []);
  
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; duplicateInvoiceId?: string } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSummaryVisible, setIsSummaryVisible] = useState<boolean>(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
  const [isChatHistoryVisible, setIsChatHistoryVisible] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const addHistoryEntry = useCallback((message: string, type: HistoryEntry['type']) => {
    const newEntry: HistoryEntry = {
      id: new Date().toISOString() + Math.random(),
      timestamp: new Date().toISOString(),
      message,
      type,
    };
    setHistory(prev => [newEntry, ...prev]);
  }, [setHistory]);

  const handleProjectSetup = (info: ProjectInfo) => {
    setProjectInfo(info);
    addHistoryEntry(`Proyecto "${info.communityName}" iniciado.`, 'project');
  };
  
  const handleResetProject = () => {
    if (window.confirm("¿Estás seguro de que quieres reiniciar? Se borrarán todos los datos del proyecto (facturas, fases, etc.).")) {
      addHistoryEntry(`Proyecto "${projectInfo?.communityName}" fue reiniciado.`, 'system');
      setProjectInfo(null);
      setInvoices([]);
      setPhases([]);
      setHistory([]);
      setActivePhaseId(null);
      setSearchTerm('');
      setFilterDate('');
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const extractedData = await extractInvoiceData(file);
      
      const duplicateInvoice = invoices.find(
        invoice => 
          invoice.rif.trim().toLowerCase() === extractedData.rif.trim().toLowerCase() &&
          invoice.invoiceNumber.trim() === extractedData.invoiceNumber.trim()
      );

      if (duplicateInvoice) {
        setError({
          message: `Factura duplicada: Ya existe una factura con el Nro. "${extractedData.invoiceNumber}" para el proveedor con RIF "${extractedData.rif}".`,
          duplicateInvoiceId: duplicateInvoice.id
        });
        setIsLoading(false);
        // Desvanecer el resaltado visual después de unos segundos
        setTimeout(() => {
          setError(prev => prev ? { ...prev, duplicateInvoiceId: undefined } : null);
        }, 4000);
        return; // Detener el procesamiento aquí
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const newInvoice: Invoice = {
          ...extractedData,
          id: new Date().toISOString() + Math.random(),
          fileDataUrl: reader.result as string,
          fileType: file.type,
          fileName: file.name,
        };
        setInvoices(prev => [newInvoice, ...prev]);
        addHistoryEntry(`Factura Nro. ${newInvoice.invoiceNumber} de "${newInvoice.supplierName}" fue procesada.`, 'invoice');
        setIsLoading(false);
      };
      reader.onerror = () => {
        // En lugar de lanzar un error, lo establecemos en el estado para mostrarlo
        setError({ message: "No se pudo leer el archivo." });
        setIsLoading(false);
      }
    } catch (err) {
      setError({ message: (err as Error).message });
      setIsLoading(false);
    }
  }, [invoices, setInvoices, addHistoryEntry]);

  const handleAddPhase = (phaseName: string) => {
    const newPhase: Phase = {
      id: new Date().toISOString() + Math.random(),
      name: phaseName,
    };
    setPhases(prev => [...prev, newPhase]);
    addHistoryEntry(`Fase "${phaseName}" creada.`, 'phase');
  };

  const handleUpdateInvoicePhase = useCallback((invoiceId: string, phaseId: string) => {
    setInvoices(prevInvoices => {
        const invoice = prevInvoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            const phase = phases.find(p => p.id === phaseId);
            if(phase) {
                addHistoryEntry(`Factura Nro. ${invoice.invoiceNumber} asignada a la fase "${phase.name}".`, 'invoice');
            } else {
                addHistoryEntry(`Factura Nro. ${invoice.invoiceNumber} fue desasignada de su fase.`, 'invoice');
            }
        }
        return prevInvoices.map(inv => 
            inv.id === invoiceId ? { ...inv, phaseId: phaseId || undefined } : inv
        );
    });
  }, [setInvoices, phases, addHistoryEntry]);

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
  }, []);
  
  const handleDeleteInvoice = useCallback((invoiceId: string) => {
      const invoiceToDelete = invoices.find(inv => inv.id === invoiceId);
      if (invoiceToDelete) {
          addHistoryEntry(`Factura Nro. ${invoiceToDelete.invoiceNumber} de "${invoiceToDelete.supplierName}" fue eliminada.`, 'invoice');
      }
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
  }, [invoices, setInvoices, addHistoryEntry]);

  const filteredInvoices = useMemo(() => {
    let invoicesToFilter = Array.isArray(invoices) ? invoices.filter(inv => inv && typeof inv === 'object') : [];

    if (activePhaseId !== null) {
      invoicesToFilter = invoicesToFilter.filter(inv => inv.phaseId === activePhaseId);
    }
    
    if (searchTerm.trim() !== '') {
      const lowercasedSearchTerm = searchTerm.trim().toLowerCase();
      invoicesToFilter = invoicesToFilter.filter(inv => 
        inv.supplierName && typeof inv.supplierName === 'string' &&
        inv.supplierName.toLowerCase().includes(lowercasedSearchTerm)
      );
    }
    
    if (filterDate) {
      invoicesToFilter = invoicesToFilter.filter(inv => 
        inv.invoiceDate && inv.invoiceDate === filterDate
      );
    }

    return invoicesToFilter;
  }, [invoices, activePhaseId, searchTerm, filterDate]);

  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => {
      const amount = Number(invoice.totalAmount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [filteredInvoices]);

  if (!projectInfo) {
    return <ProjectSetup onProjectSubmit={handleProjectSetup} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header 
        projectInfo={projectInfo} 
        onShowSummary={() => setIsSummaryVisible(true)}
        onShowHistory={() => setIsHistoryVisible(true)}
        onShowChatHistory={() => setIsChatHistoryVisible(true)}
        onResetProject={handleResetProject} 
      />
      <main className="container mx-auto p-4 md:p-8">
        <PhaseManager
            phases={phases}
            activePhaseId={activePhaseId}
            onSelectPhase={setActivePhaseId}
            onAddPhase={handleAddPhase}
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <InvoiceUploader 
            onFileUpload={handleFileUpload} 
            isLoading={isLoading}
            error={error}
            onErrorDismiss={() => setError(null)}
          />
        </div>
        
        <InvoicesTable 
            invoices={filteredInvoices}
            phases={phases}
            onView={handleViewInvoice} 
            onDelete={handleDeleteInvoice}
            onUpdateInvoicePhase={handleUpdateInvoicePhase}
            totalAmount={totalAmount}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterDate={filterDate}
            onFilterDateChange={setFilterDate}
            highlightedInvoiceId={error?.duplicateInvoiceId}
        />
      </main>
      
      {selectedInvoice && (
        <InvoiceViewerModal 
            invoice={selectedInvoice} 
            onClose={() => setSelectedInvoice(null)} 
        />
      )}
      
      {isSummaryVisible && (
        <SummaryReportModal 
          projectInfo={projectInfo}
          invoices={invoices}
          phases={phases}
          onClose={() => setIsSummaryVisible(false)}
        />
      )}
      
      {isHistoryVisible && (
        <HistoryLogModal
            history={history}
            onClose={() => setIsHistoryVisible(false)}
        />
      )}

      {isChatHistoryVisible && (
        <ChatHistoryModal
            onClose={() => setIsChatHistoryVisible(false)}
        />
      )}
    </div>
  );
};

export default App;