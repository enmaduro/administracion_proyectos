import React from 'react';
import { Invoice, Phase } from '@/types';
import { EyeIcon, TrashIcon, PencilIcon } from './icons';

// Helper local simple o impórtalo desde un utils común si lo prefieres
const formatCurrency = (amount: number) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(numericAmount);
};

interface InvoiceRowProps {
    invoice: Invoice;
    phases: Phase[];
    isHighlighted: boolean;
    onView: (invoice: Invoice) => void;
    onEdit: (invoice: Invoice) => void;
    onDelete: (id: string) => void;
    onUpdatePhase: (id: string, phaseId: string) => void;
}

export const InvoiceRow: React.FC<InvoiceRowProps> = ({
    invoice,
    phases,
    isHighlighted,
    onView,
    onEdit,
    onDelete,
    onUpdatePhase,
}) => {
    return (
        <tr className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20 transition-colors ${isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''
            }`}>
            <td className="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {invoice.invoiceDate}
            </td>
            <td className="px-4 py-2">{invoice.supplierName}</td>
            <td className="px-4 py-2">{invoice.rif}</td>
            <td className="px-4 py-2">{invoice.invoiceNumber}</td>
            <td className="px-4 py-2 text-right font-mono">
                {formatCurrency(invoice.totalAmount)}
            </td>
            <td className="px-4 py-2 min-w-[150px]">
                <select
                    value={invoice.phaseId || ''}
                    onChange={(e) => onUpdatePhase(invoice.id, e.target.value)}
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
                    <button onClick={() => onView(invoice)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400" title="Ver">
                        <EyeIcon />
                    </button>
                    <button onClick={() => onEdit(invoice)} className="text-green-600 hover:text-green-800 dark:text-green-400" title="Editar">
                        <PencilIcon />
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm(`¿Eliminar factura Nº ${invoice.invoiceNumber}?`)) {
                                onDelete(invoice.id);
                            }
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                        title="Eliminar"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </td>
        </tr>
    );
};
