// src/components/ManualInvoiceModal.tsx
import React from 'react';
import { Invoice } from '@/types';
import { useManualInvoiceForm } from '@hooks/useManualInvoiceForm';

interface ManualInvoiceModalProps {
    onSave: (invoice: Invoice) => void;
    onClose: () => void;
    existingInvoices: Invoice[];
    invoiceToEdit?: Invoice;
}

const ManualInvoiceModal: React.FC<ManualInvoiceModalProps> = ({ onSave, onClose, existingInvoices, invoiceToEdit }) => {
    const {
        formData,
        suggestions,
        handleInputChange,
        handleSupplierChange,
        selectSupplier,
        handleSubmit
    } = useManualInvoiceForm({
        existingInvoices,
        invoiceToEdit,
        onSave,
        onClose
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Registrar Gasto Manual</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                            <input
                                type="date"
                                name="invoiceDate"
                                required
                                value={formData.invoiceDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto Total</label>
                            <input
                                type="number"
                                name="totalAmount"
                                step="0.01"
                                required
                                value={formData.totalAmount}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                        <input
                            type="text"
                            name="supplierName"
                            required
                            value={formData.supplierName}
                            onChange={handleSupplierChange}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Nombre del comercio"
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                                {suggestions.map((s, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => selectSupplier(s)}
                                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-700 dark:text-gray-200"
                                    >
                                        {s.name} <span className="text-xs text-gray-500">({s.rif})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RIF</label>
                            <input
                                type="text"
                                name="rif"
                                required
                                value={formData.rif}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="J-12345678-9"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nro. Factura / Recibo</label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                required
                                value={formData.invoiceNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="000123"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea
                            name="itemsDescription"
                            required
                            value={formData.itemsDescription}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                            placeholder="Detalle de la compra..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Guardar Gasto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualInvoiceModal;
