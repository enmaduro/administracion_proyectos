import React, { memo } from 'react';
import { Invoice, Phase, ProjectInfo } from '@/types';
import { DownloadIcon } from './icons';
import { InvoiceRow } from './InvoiceRow';
import { exportToExcel } from '@utils/exportToExcel';

// Helper para formatear la moneda
const formatCurrency = (amount: number) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(numericAmount);
};

interface InvoicesTableProps {
    invoices: Invoice[];
    phases: Phase[];
    projectInfo: ProjectInfo;
    onView: (invoice: Invoice) => void;
    onDelete: (invoiceId: string) => void;
    onUpdateInvoicePhase: (invoiceId: string, phaseId: string) => void;
    onEdit: (invoice: Invoice) => void;
    totalAmount: number;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    filterDate: string;
    onFilterDateChange: (date: string) => void;
    highlightedInvoiceId?: string;
}

const InvoicesTableComponent: React.FC<InvoicesTableProps> = ({
    invoices,
    phases,
    projectInfo,
    onView,
    onDelete,
    onUpdateInvoicePhase,
    onEdit,
    totalAmount,
    searchTerm,
    onSearchTermChange,
    filterDate,
    onFilterDateChange,
    highlightedInvoiceId,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            {/* HEADER Y FILTROS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Listado de Facturas</h2>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition w-full md:w-auto"
                    />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => onFilterDateChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition w-full md:w-auto"
                    />
                    <button
                        onClick={() => exportToExcel(invoices, phases, projectInfo)}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition w-full md:w-auto"
                    >
                        <DownloadIcon />
                        <span className="ml-2">Excel</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-4 py-3">Fecha</th>
                            <th scope="col" className="px-4 py-3">Proveedor</th>
                            <th scope="col" className="px-4 py-3">RIF</th>
                            <th scope="col" className="px-4 py-3">Nro. Factura</th>
                            <th scope="col" className="px-4 py-3 text-right">Monto</th>
                            <th scope="col" className="px-4 py-3">Fase</th>
                            <th scope="col" className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices && invoices.length > 0 ? (
                            invoices.map((inv) => (
                                <InvoiceRow
                                    key={inv.id}
                                    invoice={inv}
                                    phases={phases}
                                    isHighlighted={highlightedInvoiceId === inv.id}
                                    onView={onView}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onUpdatePhase={onUpdateInvoicePhase}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No se han encontrado facturas. Comience por subir una.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700">
                            <td colSpan={4} className="px-4 py-3 text-right text-base">Total General (Filtrado)</td>
                            <td className="px-4 py-3 text-right text-base font-mono">{formatCurrency(totalAmount)}</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default memo(InvoicesTableComponent);