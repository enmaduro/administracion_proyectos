import React, { useState, useMemo } from 'react';
import { Invoice } from '@/types';
import { useProjectData } from '@hooks/useProjectData';
import BudgetBase from '@components/BudgetBase';
import InvoiceUploader from '@components/InvoiceUploader';
import InvoicesTable from '@components/InvoicesTable';
import PhaseManager from '@components/PhaseManager';
import SummaryReportModal from '@components/SummaryReportModal';
import HistoryLogModal from '@components/HistoryLogModal';
import InvoiceViewerModal from '@components/InvoiceViewerModal';
import ManualInvoiceModal from '@components/ManualInvoiceModal';
import Header from '@components/Header';
import ProjectSetup from '@components/ProjectSetup';
import Footer from '@components/Footer';

interface ProjectDashboardProps {
    activeProjectId: string;
    onBack: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ activeProjectId, onBack }) => {
    // 1. Conectar al "Cerebro" (Hook de lógica de negocio)
    const {
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
    } = useProjectData(activeProjectId);

    // 2. Estado de UI Local (Solo controladores visuales)
    const [activeView, setActiveView] = useState<'invoices' | 'budget'>('invoices');
    const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Visibilidad de Modales
    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isDebugLogVisible, setIsDebugLogVisible] = useState(false);

    // Estado de Edición de Factura Manual
    const [isManualInvoiceVisible, setIsManualInvoiceVisible] = useState(false);
    const [manualInvoiceToEdit, setManualInvoiceToEdit] = useState<Invoice | undefined>(undefined);

    // 3. Filtrado de datos (Lógica de vista)
    const filteredInvoices = useMemo(() => {
        let res = invoices;
        if (activePhaseId) res = res.filter(i => i.phaseId === activePhaseId);
        if (searchTerm) res = res.filter(i => i.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterDate) res = res.filter(i => i.invoiceDate === filterDate);
        return res;
    }, [invoices, activePhaseId, searchTerm, filterDate]);

    // Handler para importar con input oculto
    const triggerImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                if (window.confirm("Se reemplazarán los datos actuales. ¿Continuar?")) {
                    handleImport(file);
                }
            }
        };
        input.click();
    };

    if (!projectInfo) return <ProjectSetup onProjectSubmit={handleProjectSetup} />;

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <Header
                projectInfo={projectInfo}
                onShowSummary={() => setIsSummaryVisible(true)}
                onShowHistory={() => setIsHistoryVisible(true)}
                onResetProject={handleResetProject}
                onBack={onBack}
                onExport={handleExport}
                onImport={triggerImport}
                onShowBudget={() => setActiveView('budget')}
                onShowInvoices={() => setActiveView('invoices')}
                activeView={activeView}
            />

            <main className="container mx-auto p-4 md:p-8">
                <PhaseManager
                    phases={phases}
                    activePhaseId={activePhaseId}
                    onSelectPhase={setActivePhaseId}
                    onAddPhase={handleAddPhase}
                />

                {activeView === 'budget' ? (
                    <BudgetBase
                        items={budgetItems}
                        onAddItem={handleAddBudgetItem}
                        onUpdateItem={handleUpdateBudgetItem}
                        onDeleteItem={handleDeleteBudgetItem}
                    />
                ) : (
                    <>
                        {/* MÉTRICAS RÁPIDAS - DISEÑO MODERNO */}
                        {projectInfo.budget !== undefined && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Presupuesto (Gradiente Primario) */}
                                <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20 flex flex-col justify-between h-40">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-primary-100 text-sm font-medium uppercase tracking-wider">Presupuesto Total</h3>
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold mt-2">Bs. {projectInfo.budget.toLocaleString('es-VE')}</p>
                                </div>

                                {/* Gastado (Tarjeta Blanca con Acento Naranja) */}
                                <div className="bg-surface dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-700 flex flex-col justify-between h-40">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Ejecutado</h3>
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">Bs. {totalAmount.toLocaleString('es-VE')}</p>
                                </div>

                                {/* Restante (Tarjeta Dinámica) */}
                                <div className={`rounded-2xl p-6 shadow-sm border flex flex-col justify-between h-40 ${
                                    remainingBudget && remainingBudget >= 0 
                                        ? 'bg-surface dark:bg-gray-800 border-slate-200 dark:border-gray-700' 
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Saldo Disponible</h3>
                                        <div className={`p-2 rounded-lg ${
                                            remainingBudget && remainingBudget >= 0 
                                                ? 'bg-green-100 text-green-600' 
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className={`text-3xl font-bold ${
                                        remainingBudget && remainingBudget >= 0 
                                            ? 'text-slate-900 dark:text-white' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        Bs. {remainingBudget?.toLocaleString('es-VE')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* SECCIÓN CARGA FACTURAS */}
                        <div className="bg-surface dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-6 mb-8">
                            <InvoiceUploader
                                onFileUpload={handleFileUpload}
                                isLoading={isLoading}
                                error={error}
                                onErrorDismiss={() => setError(null)}
                            />

                            <div className="flex flex-col items-center gap-4 mt-6">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-gray-700 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600">
                                    <input
                                        type="checkbox"
                                        id="cloudOCR"
                                        checked={useCloudOCR}
                                        onChange={(e) => setUseCloudOCR(e.target.checked)}
                                        className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="cloudOCR" className="cursor-pointer select-none text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Usar Lectura en la Nube (Mejor precisión)
                                    </label>
                                </div>

                                <button
                                    onClick={() => {
                                        setManualInvoiceToEdit(undefined);
                                        setIsManualInvoiceVisible(true);
                                    }}
                                    className="flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Registrar Gasto Manual
                                </button>
                            </div>

                            {/* DEBUG LOG */}
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-700">
                                <button
                                    onClick={() => setIsDebugLogVisible(!isDebugLogVisible)}
                                    className="text-xs text-slate-400 hover:text-primary-600 transition-colors font-medium"
                                >
                                    {isDebugLogVisible ? 'Ocultar' : 'Mostrar'} información técnica
                                </button>
                                {isDebugLogVisible && (
                                    <div className="mt-2 p-3 bg-slate-900 text-green-400 rounded-lg font-mono text-[10px] max-h-40 overflow-y-auto shadow-inner">
                                        {debugLog.map((line, i) => <div key={i}>{line}</div>)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* LISTADO PRINCIPAL */}
                        <InvoicesTable
                            invoices={filteredInvoices}
                            phases={phases}
                            projectInfo={projectInfo}
                            onView={setSelectedInvoice}
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
                    </>
                )}
            </main>

            {/* MODALES */}
            {selectedInvoice && (
                <InvoiceViewerModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}

            {isManualInvoiceVisible && (
                <ManualInvoiceModal
                    onSave={(inv) => {
                        handleSaveInvoice(inv, !!manualInvoiceToEdit);
                        setIsManualInvoiceVisible(false);
                    }}
                    onClose={() => setIsManualInvoiceVisible(false)}
                    invoiceToEdit={manualInvoiceToEdit}
                    existingInvoices={invoices}
                />
            )}

            {isSummaryVisible && (
                <SummaryReportModal
                    projectInfo={projectInfo}
                    invoices={invoices}
                    phases={phases}
                    budgetItems={budgetItems}
                    mode={activeView}
                    onClose={() => setIsSummaryVisible(false)}
                />
            )}

            {isHistoryVisible && (
                <HistoryLogModal
                    history={history}
                    onClose={() => setIsHistoryVisible(false)}
                />
            )}

            <Footer />
        </div>
    );
};

export default ProjectDashboard;