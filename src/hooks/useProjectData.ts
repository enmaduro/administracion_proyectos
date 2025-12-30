import { useState, useCallback, useMemo } from 'react';
import { ProjectInfo, Invoice, Phase, HistoryEntry, BudgetItem, ChatEntry } from '@/types';
import { extractInvoiceDataLocal, extractInvoiceDataCloud } from '@services/ocrService';
import { exportProjectData, validateAndParseBackup } from '@services/dataService';
import { usePersistentState } from '@hooks/usePersistentState';

export const useProjectData = (projectId: string) => {
    // --- 1. ESTADO DE DATOS (Persistente) ---
    const [projectInfo, setProjectInfo] = usePersistentState<ProjectInfo | null>(`project-${projectId}-info`, null);
    const [invoices, setInvoices] = usePersistentState<Invoice[]>(`project-${projectId}-invoices`, []);
    const [phases, setPhases] = usePersistentState<Phase[]>(`project-${projectId}-phases`, []);
    const [history, setHistory] = usePersistentState<HistoryEntry[]>(`project-${projectId}-history`, []);
    const [budgetItems, setBudgetItems] = usePersistentState<BudgetItem[]>(`project-${projectId}-budget-items`, []);
    const [chatHistory, setChatHistory] = usePersistentState<ChatEntry[]>(`project-${projectId}-chat-history`, []);

    // --- 2. ESTADO DE PROCESAMIENTO (UI Técnica) ---
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<{ message: string; duplicateInvoiceId?: string } | null>(null);
    const [useCloudOCR, setUseCloudOCR] = useState(true); // Configuración de OCR
    const [debugLog, setDebugLog] = useState<string[]>(['Log de depuración iniciado.']);

    // --- 3. HELPERS INTERNOS ---
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

    // --- 4. HANDLERS DE NEGOCIO ---

    const handleProjectSetup = (info: ProjectInfo) => {
        setProjectInfo(info);
        addHistoryEntry(`Proyecto "${info.communityName}" iniciado.`, 'project');
    };

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        addDebugLog(`Iniciando: ${file.name} (${useCloudOCR ? 'NUBE' : 'LOCAL'})`);

        try {
            let extractedData;
            try {
                if (useCloudOCR) {
                    addDebugLog("Intentando OCR Nube...");
                    extractedData = await extractInvoiceDataCloud(file);
                    addDebugLog("Éxito OCR Nube.");
                } else {
                    throw new Error("Modo Local forzado");
                }
            } catch (cloudErr) {
                console.warn("Fallo Nube, usando Local", cloudErr);
                addDebugLog(`Fallo Nube. Usando Local.`);
                extractedData = await extractInvoiceDataLocal(file);
            }

            if (!extractedData.rif?.trim() && !extractedData.invoiceNumber?.trim() && extractedData.totalAmount === 0) {
                throw new Error("No se detectaron datos claros.");
            }

            // Check duplicate
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
            const msg = err instanceof Error ? err.message : String(err);
            setError({ message: msg });
            addDebugLog(`Error: ${msg}`);
            setIsLoading(false);
        }
    }, [invoices, useCloudOCR, addDebugLog, addHistoryEntry, setInvoices]);

    const handleSaveInvoice = useCallback((invoice: Invoice, isEditing: boolean) => {
        if (isEditing) {
            setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
            addHistoryEntry(`Factura ${invoice.invoiceNumber} actualizada.`, 'invoice');
        } else {
            setInvoices(prev => [invoice, ...prev]);
            addHistoryEntry(`Factura ${invoice.invoiceNumber} guardada.`, 'invoice');
        }
    }, [addHistoryEntry, setInvoices]);

    const handleDeleteInvoice = useCallback((invoiceId: string) => {
        setInvoices(prev => {
            const inv = prev.find(i => i.id === invoiceId);
            if (inv) addHistoryEntry(`Factura ${inv.invoiceNumber} eliminada.`, 'invoice');
            return prev.filter(i => i.id !== invoiceId);
        });
    }, [addHistoryEntry, setInvoices]);

    const handleUpdateInvoicePhase = useCallback((invoiceId: string, phaseId: string) => {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, phaseId } : inv));
    }, [setInvoices]);

    const handleAddPhase = (name: string) => {
        const newPhase: Phase = { id: Date.now().toString(), name };
        setPhases(prev => [...prev, newPhase]);
        addHistoryEntry(`Fase "${name}" creada.`, 'phase');
    };

    const handleResetProject = () => {
        if (window.confirm("¿Reiniciar proyecto? Se borrarán todos los datos.")) {
            setProjectInfo(null);
            setInvoices([]);
            setPhases([]);
            setHistory([]);
            setBudgetItems([]);
            setChatHistory([]);
        }
    };

    const handleAddBudgetItem = (item: BudgetItem) => {
        setBudgetItems(prev => [...prev, item]);
        addHistoryEntry(`Item "${item.item}" al presupuesto.`, 'system');
    };

    const handleUpdateBudgetItem = (item: BudgetItem) => {
        setBudgetItems(prev => prev.map(i => i.id === item.id ? item : i));
    };

    const handleDeleteBudgetItem = (id: string) => {
        setBudgetItems(prev => prev.filter(i => i.id !== id));
    };

    const handleExport = () => {
        if (projectInfo) {
            exportProjectData(projectInfo, invoices, phases, history, chatHistory, budgetItems);
            addHistoryEntry('Respaldo exportado.', 'system');
        }
    };

    const handleImport = async (file: File) => {
        try {
            setIsLoading(true);
            const backup = await validateAndParseBackup(file);
            setProjectInfo(backup.projectInfo);
            setInvoices(backup.invoices);
            setPhases(backup.phases);
            setHistory(backup.history);
            setBudgetItems(backup.budgetItems || []);
            setChatHistory(backup.chatHistory || []);
            addHistoryEntry('Proyecto restaurado.', 'system');
        } catch (err) {
            alert("Error al importar.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 5. DERIVADOS ---
    const totalAmount = useMemo(() => invoices.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0), [invoices]);
    const remainingBudget = useMemo(() => projectInfo?.budget ? projectInfo.budget - totalAmount : null, [projectInfo, totalAmount]);

    return {
        projectInfo,
        invoices,
        phases,
        history,
        budgetItems,
        totalAmount,
        remainingBudget,
        isLoading,
        error,
        useCloudOCR,
        debugLog,
        setUseCloudOCR,
        setError,
        setDebugLog,
        handleProjectSetup,
        handleFileUpload,
        handleSaveInvoice,
        handleDeleteInvoice,
        handleUpdateInvoicePhase,
        handleAddPhase,
        handleResetProject,
        handleAddBudgetItem,
        handleUpdateBudgetItem,
        handleDeleteBudgetItem,
        handleExport,
        handleImport,
    };
};
