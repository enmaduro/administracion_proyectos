// src/components/ProjectDashboard.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { ProjectInfo, Invoice, Phase, HistoryEntry } from '../types';
import ProjectSetup from './ProjectSetup';
import Header from './Header';
import InvoiceUploader from './InvoiceUploader';
import InvoicesTable from './InvoicesTable';
import { extractInvoiceData } from '../services/geminiService';
import InvoiceViewerModal from './InvoiceViewerModal';
import PhaseManager from './PhaseManager';
import SummaryReportModal from './SummaryReportModal';
import HistoryLogModal from './HistoryLogModal';
import ChatHistoryModal from './ChatHistoryModal';
import EditInvoiceModal from './EditInvoiceModal';
import ManualInvoiceModal from './ManualInvoiceModal';

interface ProjectDashboardProps {
    projectId: string;
    onBack: () => void;
}

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
            setStoredValue((prevValue) => { const valueToStore = value instanceof Function ? value(prevValue) : value; window.localStorage.setItem(key, JSON.stringify(valueToStore)); return valueToStore; });
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key]);

    return [storedValue, setValue];
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projectId, onBack }) => {
    // Claves dinámicas basadas en projectId
    const [projectInfo, setProjectInfo] = usePersistentState<ProjectInfo | null>(`project-${projectId}-info`, null);
    const [invoices, setInvoices] = usePersistentState<Invoice[]>(`project-${projectId}-invoices`, []);
    const [phases, setPhases] = usePersistentState<Phase[]>(`project-${projectId}-phases`, []);
    const [history, setHistory] = usePersistentState<HistoryEntry[]>(`project-${projectId}-history`, []);

    const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<{ message: string; duplicateInvoiceId?: string } | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isSummaryVisible, setIsSummaryVisible] = useState<boolean>(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
    const [isChatHistoryVisible, setIsChatHistoryVisible] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [isDebugLogVisible, setIsDebugLogVisible] = useState<boolean>(false);
    const [debugLog, setDebugLog] = useState<string[]>(['Log de depuración iniciado.']);

    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [isManualEntryVisible, setIsManualEntryVisible] = useState<boolean>(false);

    const addDebugLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString('es-VE');
        setDebugLog(prev => [`[${timestamp}] ${message}`, ...prev]);
    };

    const addHistoryEntry = useCallback((message: string, type: HistoryEntry['type']) => {
        const newEntry: HistoryEntry = {
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date().toISOString(),
            message,
            type,
        };
        setHistory(prev => [newEntry, ...prev]);
    }, []);

    const handleProjectSetup = (info: ProjectInfo) => {
        setProjectInfo(info);
        addHistoryEntry(`Proyecto "${info.communityName}" iniciado.`, 'project');
    };

    const handleResetProject = () => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar este proyecto? Se borrarán todos los datos (facturas, fases, etc.).")) {
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

            let extractedDataStr = 'Datos extraídos por IA: (no serializable)';
            try {
                extractedDataStr = `Datos extraídos por IA: ${JSON.stringify(extractedData)}`;
            } catch (e) {
                console.error("Error al serializar extractedData para el log:", e);
            }
            addDebugLog(extractedDataStr);

            if (!extractedData.rif?.trim() || !extractedData.invoiceNumber?.trim()) {
                const missingFields = [
                    !extractedData.rif?.trim() && "RIF",
                    !extractedData.invoiceNumber?.trim() && "Nro. Factura"
                ].filter(Boolean).join(' y ');
                throw new Error(`La IA no pudo extraer datos esenciales (${missingFields}). Asegúrese de que sean legibles en el documento.`);
            }

            const normalizeStandard = (value: string | undefined): string =>
                value ? value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';

            const normalizeInvoiceNumber = (value: string | undefined): string =>
                normalizeStandard(value).replace(/^0+/, '');

            const newRif = normalizeStandard(extractedData.rif);
            const newInvoiceNumber = normalizeInvoiceNumber(extractedData.invoiceNumber);

            let duplicateInvoice: Invoice | null = null;
            addDebugLog('--- INICIANDO COMPROBACIÓN DE DUPLICADOS ---');
            addDebugLog(`Factura Nueva: RIF [${extractedData.rif}] -> Normalizado [${newRif}]`);
            addDebugLog(`Factura Nueva: Nro [${extractedData.invoiceNumber}] -> Normalizado [${newInvoiceNumber}]`);
            addDebugLog('--------------------------------------------');

            for (const invoice of invoices) {
                const existingRif = normalizeStandard(invoice.rif);
                const existingInvoiceNumber = normalizeInvoiceNumber(invoice.invoiceNumber);
                addDebugLog(`Comparando con Factura ID: ${invoice.id.slice(-6)}`);
                addDebugLog(`  > RIF Existente: [${invoice.rif}] -> Normalizado [${existingRif}]`);
                addDebugLog(`  > Nro Existente: [${invoice.invoiceNumber}] -> Normalizado [${existingInvoiceNumber}]`);

                const isRifMatch = existingRif === newRif;
                const isInvoiceNumMatch = existingInvoiceNumber === newInvoiceNumber;

                if (isRifMatch && isInvoiceNumMatch) {
                    duplicateInvoice = invoice;
                    addDebugLog(`  > RESULTADO: ¡COINCIDENCIA ENCONTRADA!`);
                    addDebugLog('--------------------------------------------');
                    break;
                } else {
                    addDebugLog(`  > RESULTADO: No coincide.`);
                }
            }

            if (duplicateInvoice) {
                addDebugLog('--- VEREDICTO FINAL: FACTURA DUPLICADA ---');
                setError({
                    message: `Factura duplicada: Ya existe una factura con el Nro. "${extractedData.invoiceNumber}" para el proveedor con RIF "${extractedData.rif}".`,
                    duplicateInvoiceId: duplicateInvoice.id
                });
                setIsLoading(false);
                setTimeout(() => {
                    setError(prev => prev ? { ...prev, duplicateInvoiceId: undefined } : null);
                }, 4000);
                return;
            }
            addDebugLog('--- VEREDICTO FINAL: NO ES DUPLICADA. AÑADIENDO FACTURA. ---');

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
                setError({ message: "No se pudo leer el archivo." });
                setIsLoading(false);
            }
        } catch (err) {
            const errorMessage = (err as Error).message;
            addDebugLog(`ERROR: ${errorMessage}`);
            setError({ message: errorMessage });
            setIsLoading(false);
        }
    }, [invoices, addHistoryEntry]);

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
                if (phase) {
                    addHistoryEntry(`Factura Nro. ${invoice.invoiceNumber} asignada a la fase "${phase.name}".`, 'invoice');
                } else {
                    addHistoryEntry(`Factura Nro. ${invoice.invoiceNumber} fue desasignada de su fase.`, 'invoice');
                }
            }
            return prevInvoices.map(inv =>
                inv.id === invoiceId ? { ...inv, phaseId: phaseId || undefined } : inv
            );
        });
    }, [phases, addHistoryEntry]);

    const handleViewInvoice = useCallback((invoice: Invoice) => {
        setSelectedInvoice(invoice);
    }, []);

    const handleDeleteInvoice = useCallback((invoiceId: string) => {
        const invoiceToDelete = invoices.find(inv => inv.id === invoiceId);
        if (invoiceToDelete) {
            addHistoryEntry(`Factura Nro. ${invoiceToDelete.invoiceNumber} de "${invoiceToDelete.supplierName}" fue eliminada.`, 'invoice');
        }
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    }, [invoices, addHistoryEntry]);

    const handleSaveInvoice = (updated: Invoice) => {
        setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
        addHistoryEntry(`Factura Nº ${updated.invoiceNumber} fue editada manualmente.`, 'invoice');
    };

    const handleSaveManualInvoice = (newInvoice: Invoice) => {
        setInvoices(prev => [newInvoice, ...prev]);
        addHistoryEntry(`Gasto manual Nº ${newInvoice.invoiceNumber} de "${newInvoice.supplierName}" registrado.`, 'invoice');
        setIsManualEntryVisible(false);
    };

    const filteredInvoices = useMemo(() => {
        let invoicesToFilter = Array.isArray(invoices) ? invoices.filter(inv => inv && typeof inv === 'object') : [];
        if (activePhaseId !== null) invoicesToFilter = invoicesToFilter.filter(inv => inv.phaseId === activePhaseId);
        if (searchTerm.trim() !== '') {
            const lowercasedSearchTerm = searchTerm.trim().toLowerCase();
            invoicesToFilter = invoicesToFilter.filter(inv =>
                inv.supplierName && typeof inv.supplierName === 'string' &&
                inv.supplierName.toLowerCase().includes(lowercasedSearchTerm)
            );
        }
        if (filterDate) invoicesToFilter = invoicesToFilter.filter(inv => inv.invoiceDate === filterDate);
        return invoicesToFilter;
    }, [invoices, activePhaseId, searchTerm, filterDate]);

    const totalAmount = useMemo(() => {
        return filteredInvoices.reduce((sum, invoice) => {
            const amount = Number(invoice.totalAmount);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
    }, [filteredInvoices]);

    const remainingBudget = useMemo(() => {
        if (projectInfo?.budget) {
            return projectInfo.budget - totalAmount;
        }
        return null;
    }, [projectInfo, totalAmount]);

    if (!projectInfo) return <ProjectSetup onProjectSubmit={handleProjectSetup} />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Header
                projectInfo={projectInfo}
                onShowSummary={() => setIsSummaryVisible(true)}
                onShowHistory={() => setIsHistoryVisible(true)}
                onShowChatHistory={() => setIsChatHistoryVisible(true)}
                onResetProject={handleResetProject}
                onBack={onBack}
            />
            <main className="container mx-auto p-4 md:p-8">
                <PhaseManager
                    phases={phases}
                    activePhaseId={activePhaseId}
                    onSelectPhase={setActivePhaseId}
                    onAddPhase={handleAddPhase}
                />

                {projectInfo.budget !== undefined && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Presupuesto Inicial</h3>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                                Bs. {projectInfo.budget.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Gastado</h3>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                                Bs. {totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 ${remainingBudget && remainingBudget >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Saldo Restante</h3>
                            <p className={`text-2xl font-bold mt-2 ${remainingBudget && remainingBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                Bs. {remainingBudget?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <InvoiceUploader
                        onFileUpload={handleFileUpload}
                        isLoading={isLoading}
                        error={error}
                        onErrorDismiss={() => setError(null)}
                    />

                    <div className="flex justify-center mb-4">
                        <button
                            onClick={() => setIsManualEntryVisible(true)}
                            className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Registrar Gasto Manualmente
                        </button>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setIsDebugLogVisible(prev => !prev)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {isDebugLogVisible ? 'Ocultar' : 'Mostrar'} Log de Depuración
                            </button>
                            {isDebugLogVisible && (
                                <button
                                    onClick={() => setDebugLog(['Log de depuración reiniciado.'])}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-white"
                                >
                                    Limpiar Log
                                </button>
                            )}
                        </div>

                        {isDebugLogVisible && (
                            <div className="mt-2 p-4 bg-gray-900 dark:bg-black text-white rounded-lg max-h-60 overflow-y-auto font-mono text-xs border border-gray-700">
                                <pre><code>{debugLog.join('\n')}</code></pre>
                            </div>
                        )}
                    </div>
                </div>

                <InvoicesTable
                    invoices={filteredInvoices}
                    phases={phases}
                    onView={handleViewInvoice}
                    onDelete={handleDeleteInvoice}
                    onUpdateInvoicePhase={handleUpdateInvoicePhase}
                    onEdit={setEditingInvoice}
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

            {editingInvoice && (
                <EditInvoiceModal
                    invoice={editingInvoice}
                    onSave={handleSaveInvoice}
                    onClose={() => setEditingInvoice(null)}
                />
            )}

            {isManualEntryVisible && (
                <ManualInvoiceModal
                    onSave={handleSaveManualInvoice}
                    onClose={() => setIsManualEntryVisible(false)}
                    existingInvoices={invoices}
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

export default ProjectDashboard;
