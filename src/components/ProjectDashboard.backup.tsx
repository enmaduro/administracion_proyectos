import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ProjectInfo, Invoice, Phase, HistoryEntry, ChatEntry } from '../types';
import { extractInvoiceData, chatWithGemini } from '../services/geminiService';
import { exportProjectData, validateAndParseBackup } from '../services/dataService';
import InvoiceUploader from './InvoiceUploader';
import InvoicesTable from './InvoicesTable';
import PhaseManager from './PhaseManager';
import SummaryReportModal from './SummaryReportModal';
import HistoryLogModal from './HistoryLogModal';
import InvoiceViewerModal from './InvoiceViewerModal';

import ManualInvoiceModal from './ManualInvoiceModal';
import Header from './Header';
import ProjectSetup from './ProjectSetup';
import ChatHistoryModal from './ChatHistoryModal';
import ApiKeyModal from './ApiKeyModal';
import Footer from './Footer';

interface ProjectDashboardProps {
    activeProjectId: string;
    onBack: () => void;
}

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Use a ref to hold the *latest* initialValue, but don't prevent the effect from using it.
    // Actually, for persistent state, we only want to fall back to initialValue if the key changes and nothing is found.
    // We do NOT want to reset state just because initialValue ref changed.
    const initialValueRef = useRef(initialValue);

    // Update ref if initialValue changes (though likely we don't care after mount)
    useEffect(() => {
        initialValueRef.current = initialValue;
    }, [initialValue]);

    useEffect(() => {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                setState(JSON.parse(item));
            } else {
                setState(initialValueRef.current);
            }
        } catch (error) {
            console.error(`Error resetting state for key "${key}":`, error);
            setState(initialValueRef.current);
        }
    }, [key]); // Only re-run if KEY changes. Ignore initialValue changes.

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
}


const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ activeProjectId, onBack }) => {
    // Project Data State (Persistent per project)
    const [projectInfo, setProjectInfo] = usePersistentState<ProjectInfo | null>(`project-${activeProjectId}-info`, null);
    const [invoices, setInvoices] = usePersistentState<Invoice[]>(`project-${activeProjectId}-invoices`, []);
    const [phases, setPhases] = usePersistentState<Phase[]>(`project-${activeProjectId}-phases`, []);
    const [history, setHistory] = usePersistentState<HistoryEntry[]>(`project-${activeProjectId}-history`, []);
    const [chatHistory, setChatHistory] = usePersistentState<ChatEntry[]>(`project-${activeProjectId}-chat-history`, []);

    // UI State
    const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<{ message: string; duplicateInvoiceId?: string } | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isSummaryVisible, setIsSummaryVisible] = useState<boolean>(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
    const [isChatHistoryVisible, setIsChatHistoryVisible] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Chat UI State
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Debug Log State
    const [isDebugLogVisible, setIsDebugLogVisible] = useState<boolean>(false);
    const [debugLog, setDebugLog] = useState<string[]>(['Log de depuración iniciado.']);

    // Config State
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Invoice Editing/Manual Entry State

    const [isManualInvoiceVisible, setIsManualInvoiceVisible] = useState<boolean>(false);
    const [manualInvoiceToEdit, setManualInvoiceToEdit] = useState<Invoice | undefined>(undefined);

    const addDebugLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString('es-VE');
        setDebugLog(prev => [`[${timestamp}] ${message}`, ...prev]);
    }, []);

    const addHistoryEntry = useCallback((message: string, type: HistoryEntry['type']) => {
        const newEntry: HistoryEntry = {
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date().toISOString(),
            message,
            type,
        };
        setHistory(prev => [newEntry, ...prev]);
    }, [setHistory]);

    const handleSendMessage = async (message: string) => {
        const userMsg: ChatEntry = {
            id: Date.now().toString(),
            sender: 'user',
            text: message,
            timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, userMsg]);
        setIsChatLoading(true);

        try {
            const totalAmountVal = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
            const context = {
                projectInfo,
                invoices,
                phases,
                totalAmount: totalAmountVal
            };
            const responseText = await chatWithGemini(message, context, projectInfo?.geminiApiKey);

            const aiMsg: ChatEntry = {
                id: (Date.now() + 1).toString(),
                sender: 'assistant',
                text: responseText,
                timestamp: new Date().toISOString()
            };
            setChatHistory(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Error en chat:", error);
            const errorMsg: ChatEntry = {
                id: (Date.now() + 1).toString(),
                sender: 'assistant',
                text: "Lo siento, tuve un problema al procesar tu solicitud.",
                timestamp: new Date().toISOString()
            };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleProjectSetup = (info: ProjectInfo) => {
        setProjectInfo(info);
        addHistoryEntry(`Proyecto "${info.communityName}" iniciado.`, 'project');
    };

    const handleUpdateApiKey = (newKey: string) => {
        if (projectInfo) {
            // Clean the API key: trim whitespace and remove invisible characters
            const cleanedKey = newKey.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

            // Validate API key format (should start with AIza)
            if (cleanedKey && !cleanedKey.startsWith('AIza')) {
                alert('⚠️ La API Key debe comenzar con "AIza". Por favor verifica que copiaste la clave correctamente.');
                return;
            }

            // Update project info with cleaned key
            setProjectInfo({ ...projectInfo, geminiApiKey: cleanedKey });
            addHistoryEntry(`API Key ${cleanedKey ? 'actualizada' : 'eliminada'} correctamente.`, 'system');
            setIsConfigOpen(false);

            if (cleanedKey) {
                alert('✅ Clave actualizada correctamente. Intenta subir la factura nuevamente.');
            } else {
                alert('ℹ️ API Key eliminada. Se usará la clave compartida (si está disponible).');
            }
        }
    };

    const handleResetProject = () => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar este proyecto? Se borrarán todos los datos.")) {
            addHistoryEntry(`Proyecto "${projectInfo?.communityName}" fue reiniciado.`, 'system');
            setProjectInfo(null);
            setInvoices([]);
            setPhases([]);
            setHistory([]);
            setChatHistory([]);
            setActivePhaseId(null);
        }
    };

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(prev => { if (prev) return prev; return true; });
        setError(null);
        try {
            const extractedData = await extractInvoiceData(file, projectInfo?.geminiApiKey);
            const extractedDataStr = `Datos extraídos por IA: ${JSON.stringify(extractedData)}`;
            addDebugLog(extractedDataStr);

            if (!extractedData.rif?.trim() || !extractedData.invoiceNumber?.trim()) {
                throw new Error("Datos incompletos de la IA.");
            }

            // Simple duplicate check
            const isDuplicate = invoices.some(inv =>
                inv.rif === extractedData.rif && inv.invoiceNumber === extractedData.invoiceNumber
            );

            if (isDuplicate) {
                setError({ message: "Factura duplicada detectada." });
                setIsLoading(false);
                return;
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
                addHistoryEntry(`Factura Nro. ${newInvoice.invoiceNumber} procesada.`, 'invoice');
                setIsLoading(false);
            };
        } catch (err) {
            const errMsg = (err as Error).message;
            addDebugLog(`❌ ERROR: ${errMsg}`);
            setError({ message: errMsg });
            setIsLoading(false);
        }
    }, [invoices, addDebugLog, addHistoryEntry, setInvoices]);

    const handleAddPhase = (phaseName: string) => {
        const newPhase: Phase = { id: Date.now().toString(), name: phaseName };
        setPhases(prev => [...prev, newPhase]);
        addHistoryEntry(`Fase "${phaseName}" creada.`, 'phase');
    };

    const handleUpdateInvoicePhase = useCallback((invoiceId: string, phaseId: string) => {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, phaseId } : inv));
    }, [setInvoices]);

    const handleViewInvoice = useCallback((invoice: Invoice) => setSelectedInvoice(invoice), []);

    const handleDeleteInvoice = useCallback((invoiceId: string) => {
        const inv = invoices.find(i => i.id === invoiceId);
        if (inv) addHistoryEntry(`Factura ${inv.invoiceNumber} eliminada.`, 'invoice');
        setInvoices(prev => prev.filter(i => i.id !== invoiceId));
    }, [invoices, addHistoryEntry, setInvoices]);



    // Función unificada para guardar facturas manuales (nuevas o editadas)
    const handleSaveManualInvoice = (invoice: Invoice) => {
        if (manualInvoiceToEdit) {
            // Edición
            setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
            addHistoryEntry(`Gasto manual Nº ${invoice.invoiceNumber} actualizado.`, 'invoice');
        } else {
            // Creación
            setInvoices(prev => [invoice, ...prev]);
            addHistoryEntry(`Gasto manual Nº ${invoice.invoiceNumber} registrado.`, 'invoice');
        }
        setIsManualInvoiceVisible(false);
        setManualInvoiceToEdit(undefined);
    };

    const filteredInvoices = useMemo(() => {
        let res = invoices;
        if (activePhaseId) res = res.filter(i => i.phaseId === activePhaseId);
        if (searchTerm) res = res.filter(i => i.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterDate) res = res.filter(i => i.invoiceDate === filterDate);
        return res;
    }, [invoices, activePhaseId, searchTerm, filterDate]);

    const totalAmount = useMemo(() => filteredInvoices.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0), [filteredInvoices]);
    const remainingBudget = useMemo(() => projectInfo?.budget ? projectInfo.budget - totalAmount : null, [projectInfo, totalAmount]);

    const handleExport = () => {
        if (!projectInfo) return;
        exportProjectData(projectInfo, invoices, phases, history, chatHistory);
        addHistoryEntry('Respaldo del proyecto exportado exitosamente.', 'system');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            if (!window.confirm("IMPORTANTE: Al restaurar un respaldo, se reemplazarán TODOS los datos actuales de este proyecto por los del archivo. ¿Deseas continuar?")) {
                return;
            }

            try {
                setIsLoading(true);
                const backup = await validateAndParseBackup(file);

                // Smart Restore: Preserve current API Key if the backup doesn't have one
                // This is crucial for users moving from Shared -> Personal Key via Backup/Restore
                if (!backup.projectInfo.geminiApiKey && projectInfo?.geminiApiKey) {
                    backup.projectInfo.geminiApiKey = projectInfo.geminiApiKey;
                }

                // Restore state
                setProjectInfo(backup.projectInfo);
                setInvoices(backup.invoices);
                setPhases(backup.phases);
                setHistory(backup.history);
                setChatHistory(backup.chatHistory || []);

                addHistoryEntry('Proyecto restaurado desde respaldo.', 'system');
                alert('¡Restauración exitosa!');
            } catch (err) {
                console.error("Error importando respaldo:", err);
                alert("Error al restaurar: " + (err instanceof Error ? err.message : "Archivo inválido"));
            } finally {
                setIsLoading(false);
            }
        };
        input.click();
    };

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
                onExport={handleExport}
                onImport={handleImport}
                onConfigure={() => setIsConfigOpen(true)}
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
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Presupuesto</h3>
                            <p className="text-2xl font-bold dark:text-white">Bs. {projectInfo.budget.toLocaleString('es-VE')}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Gastado</h3>
                            <p className="text-2xl font-bold text-orange-600">Bs. {totalAmount.toLocaleString('es-VE')}</p>
                        </div>
                        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 ${remainingBudget && remainingBudget >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Restante</h3>
                            <p className={`text-2xl font-bold ${remainingBudget && remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Bs. {remainingBudget?.toLocaleString('es-VE')}
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
                            onClick={() => {
                                setManualInvoiceToEdit(undefined);
                                setIsManualInvoiceVisible(true);
                            }}
                            className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
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
                    projectInfo={projectInfo}
                    onView={handleViewInvoice}
                    onDelete={handleDeleteInvoice}
                    onUpdateInvoicePhase={handleUpdateInvoicePhase}
                    onEdit={(inv) => {
                        setManualInvoiceToEdit(inv);
                        setIsManualInvoiceVisible(true);
                    }}
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



            {isManualInvoiceVisible && (
                <ManualInvoiceModal
                    onSave={handleSaveManualInvoice}
                    onClose={() => {
                        setIsManualInvoiceVisible(false);
                        setManualInvoiceToEdit(undefined);
                    }}
                    invoiceToEdit={manualInvoiceToEdit}
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
                    history={chatHistory}
                    onClose={() => setIsChatHistoryVisible(false)}
                    onSendMessage={handleSendMessage}
                    isLoading={isChatLoading}
                />
            )}


            {isConfigOpen && (
                <ApiKeyModal
                    currentApiKey={projectInfo?.geminiApiKey}
                    onSave={handleUpdateApiKey}
                    onClose={() => setIsConfigOpen(false)}
                />
            )}

            <Footer />
        </div>
    );
};

export default ProjectDashboard;
