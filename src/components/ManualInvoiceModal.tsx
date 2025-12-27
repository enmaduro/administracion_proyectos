// src/components/ManualInvoiceModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Invoice } from '../types';

interface ManualInvoiceModalProps {
    onSave: (invoice: Invoice) => void;
    onClose: () => void;
    existingInvoices: Invoice[];
    invoiceToEdit?: Invoice;
}

const ManualInvoiceModal: React.FC<ManualInvoiceModalProps> = ({ onSave, onClose, existingInvoices, invoiceToEdit }) => {
    const [formData, setFormData] = useState({
        invoiceDate: new Date().toISOString().split('T')[0],
        supplierName: '',
        rif: '',
        invoiceNumber: '',
        itemsDescription: '',
        totalAmount: '',
    });

    useEffect(() => {
        if (invoiceToEdit) {
            setFormData({
                invoiceDate: invoiceToEdit.invoiceDate,
                supplierName: invoiceToEdit.supplierName,
                rif: invoiceToEdit.rif,
                invoiceNumber: invoiceToEdit.invoiceNumber,
                itemsDescription: invoiceToEdit.itemsDescription,
                totalAmount: invoiceToEdit.totalAmount.toString(),
            });
        }
    }, [invoiceToEdit]);

    const [suggestions, setSuggestions] = useState<{ name: string; rif: string }[]>([]);

    // Extraer proveedores únicos para autocompletado
    const uniqueSuppliers = useMemo(() => {
        const map = new Map<string, string>();
        existingInvoices.forEach(inv => {
            if (inv.supplierName && inv.rif) {
                map.set(inv.supplierName.toLowerCase(), inv.rif);
            }
        });
        return Array.from(map.entries()).map(([name, rif]) => ({
            name: existingInvoices.find(i => i.supplierName.toLowerCase() === name)?.supplierName || name,
            rif
        }));
    }, [existingInvoices]);

    const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, supplierName: value }));

        if (value.length > 1) {
            const filtered = uniqueSuppliers.filter(s =>
                s.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const selectSupplier = (supplier: { name: string; rif: string }) => {
        setFormData(prev => ({ ...prev, supplierName: supplier.name, rif: supplier.rif }));
        setSuggestions([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newInvoice: Invoice = {
            id: invoiceToEdit ? invoiceToEdit.id : new Date().toISOString() + Math.random(),
            invoiceDate: formData.invoiceDate,
            supplierName: formData.supplierName,
            rif: formData.rif,
            invoiceNumber: formData.invoiceNumber,
            itemsDescription: formData.itemsDescription,
            totalAmount: parseFloat(formData.totalAmount),
            fileDataUrl: invoiceToEdit ? invoiceToEdit.fileDataUrl : '', // Mantener archivo si existe
            fileType: invoiceToEdit ? invoiceToEdit.fileType : 'manual',
            fileName: invoiceToEdit ? invoiceToEdit.fileName : 'Registro Manual',
        };

        onSave(newInvoice);
        onClose();
    };

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
                                required
                                value={formData.invoiceDate}
                                onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto Total</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.totalAmount}
                                onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                        <input
                            type="text"
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
                                required
                                value={formData.rif}
                                onChange={e => setFormData({ ...formData, rif: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="J-12345678-9"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nro. Factura / Recibo</label>
                            <input
                                type="text"
                                required
                                value={formData.invoiceNumber}
                                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="000123"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea
                            required
                            value={formData.itemsDescription}
                            onChange={e => setFormData({ ...formData, itemsDescription: e.target.value })}
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
