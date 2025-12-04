import React from 'react';
import { Invoice, Phase } from '../types.ts';
import { EyeIcon, TrashIcon, DownloadIcon, PencilIcon } from './icons.tsx';

// Helper para formatear la moneda
const formatCurrency = (amount: number) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(numericAmount);
};

interface InvoicesTableProps {
    invoices: Invoice[];
    phases: Phase[];
    onView: (invoice: Invoice) => void;
    onDelete: (invoiceId: string) => void;
    onUpdateInvoicePhase: (invoiceId: string, phaseId: string) => void;
    onEdit: (invoice: Invoice) => void;          // ← nueva prop
    totalAmount: number;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    filterDate: string;
    onFilterDateChange: (date: string) => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
    invoices,
    phases,
    onView,
    onDelete,
    onUpdateInvoicePhase,
    onEdit,                                      // ← desestructurada
    totalAmount,
    searchTerm,
    onSearchTermChange,
    filterDate,
    onFilterDateChange,
}) => {

    const handleExportCSV = () => {
        if (!invoices || invoices.length === 0) {
            alert("No hay facturas para exportar.");
            return;
        }
        const phaseMap = new Map(phases.map(p => [p.id, p.name]));
        let csv = "data:text/csv;charset=utf-8,Fecha,Proveedor,RIF,Nro. Factura,Descripción,Monto Total,Fase Asignada\r\n";
        invoices.forEach(inv => {
            const phase = inv.phaseId ? phaseMap.get(inv.phaseId) || 'N/A' : 'Sin Asignar';
            csv += [
                inv.invoiceDate,
                `"${inv.supplierName.replace(/"/g, '""')}"`,
                inv.rif,
                inv.invoiceNumber,
                `"${inv.itemsDescription.replace(/"/g, '""')}"`,
                inv.totalAmount,
                phase
            ].join(',') + '\r\n';
        });
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csv));
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
                            invoices.map((inv) => (
                                <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">{inv.invoiceDate}</td>
                                    <td className="px-4 py-2">{inv.supplierName}</td>
                                    <td className="px-4 py-2">{inv.rif}</td>
                                    <td className="px-4 py-2">{inv.invoiceNumber}</td>
                                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(inv.totalAmount)}</td>
                                    <td className="px-4 py-2 min-w-[150px]">
                                        <select
                                            value={inv.phaseId || ''}
                                            onChange={(e) => onUpdateInvoicePhase(inv.id, e.target.value)}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none p-1"
                                        >
                                            <option value="">Sin Asignar</option>
                                            {phases.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => onView(inv)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Ver Factura">
                                                <EyeIcon />
                                            </button>
                                            <button onClick={() => onEdit(inv)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300" title="Editar Factura">
                                                <PencilIcon />
                                            </button>
                                            <button onClick={() => {
                                                if (window.confirm(`¿Seguro que quieres eliminar la factura Nº ${inv.invoiceNumber} de ${inv.supplierName}?`)) {
                                                    onDelete(inv.id);
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

export default InvoicesTable;