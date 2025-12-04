import React from 'react';
import { Invoice, Phase } from '../types';
import { EyeIcon, TrashIcon, DownloadIcon } from './icons';

// Helper para formatear la moneda
const formatCurrency = (amount: number) => {
    // Se asegura de que el valor sea numérico antes de formatear
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        return 'N/A';
    }
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(numericAmount);
};

interface InvoicesTableProps {
    invoices: Invoice[];
    phases: Phase[];
    onView: (invoice: Invoice) => void;
    onDelete: (invoiceId: string) => void;
    onUpdateInvoicePhase: (invoiceId: string, phaseId: string) => void;
    totalAmount: number;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    filterDate: string;
    onFilterDateChange: (date: string) => void;
    highlightedInvoiceId?: string | null;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
    invoices,
    phases,
    onView,
    onDelete,
    onUpdateInvoicePhase,
    totalAmount,
    searchTerm,
    onSearchTermChange,
    filterDate,
    onFilterDateChange,
    highlightedInvoiceId,
}) => {

    const handleExportCSV = () => {
        if (!invoices || invoices.length === 0) {
            alert("No hay facturas para exportar.");
            return;
        }

        const phaseMap = new Map(phases.map(p => [p.id, p.name]));
        
        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = ["Fecha", "Proveedor", "RIF", "Nro. Factura", "Descripción", "Monto Total", "Fase Asignada"];
        csvContent += headers.join(",") + "\r\n";

        invoices.forEach(invoice => {
            const phaseName = invoice.phaseId ? phaseMap.get(invoice.phaseId) || 'N/A' : 'Sin Asignar';
            const row = [
                invoice.invoiceDate,
                `"${invoice.supplierName.replace(/"/g, '""')}"`,
                invoice.rif,
                invoice.invoiceNumber,
                `"${invoice.itemsDescription.replace(/"/g, '""')}"`,
                invoice.totalAmount,
                phaseName
            ];
            csvContent += row.join(",") + "\r\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reporte_gastos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Listado de Facturas</h2>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por proveedor..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition w-full md:w-auto"
                        aria-label="Buscar por proveedor"
                    />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => onFilterDateChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition w-full md:w-auto"
                        aria-label="Filtrar por fecha"
                    />
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-colors w-full md:w-auto"
                    >
                        <DownloadIcon />
                        <span className="ml-2">Exportar a CSV</span>
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
                            invoices.map((invoice) => (
                                <tr key={invoice.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20 ${invoice.id === highlightedInvoiceId ? 'highlight-row' : ''}`}>
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">{invoice.invoiceDate}</td>
                                    <td className="px-4 py-2">{invoice.supplierName}</td>
                                    <td className="px-4 py-2">{invoice.rif}</td>
                                    <td className="px-4 py-2">{invoice.invoiceNumber}</td>
                                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(invoice.totalAmount)}</td>
                                    <td className="px-4 py-2 min-w-[150px]">
                                        <select
                                            value={invoice.phaseId || ''}
                                            onChange={(e) => onUpdateInvoicePhase(invoice.id, e.target.value)}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none p-1"
                                            aria-label={`Asignar fase para la factura ${invoice.invoiceNumber}`}
                                        >
                                            <option value="">Sin Asignar</option>
                                            {phases.map(phase => (
                                                <option key={phase.id} value={phase.id}>{phase.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => onView(invoice)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Ver Factura">
                                                <EyeIcon />
                                            </button>
                                            <button onClick={() => {
                                                if (window.confirm(`¿Seguro que quieres eliminar la factura Nro. ${invoice.invoiceNumber} de ${invoice.supplierName}?`)) {
                                                    onDelete(invoice.id);
                                                }
                                            }} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Eliminar Factura">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
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

export d