import { useState, useEffect, useMemo } from 'react';
import { Invoice } from '@/types';

interface UseManualInvoiceFormProps {
    existingInvoices: Invoice[];
    invoiceToEdit?: Invoice;
    onSave: (invoice: Invoice) => void;
    onClose: () => void;
}

export const useManualInvoiceForm = ({
    existingInvoices,
    invoiceToEdit,
    onSave,
    onClose
}: UseManualInvoiceFormProps) => {
    const [formData, setFormData] = useState({
        invoiceDate: new Date().toISOString().split('T')[0],
        supplierName: '',
        rif: '',
        invoiceNumber: '',
        itemsDescription: '',
        totalAmount: '',
    });

    const [suggestions, setSuggestions] = useState<{ name: string; rif: string }[]>([]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
            rif: formData.rif.toUpperCase(),
            invoiceNumber: formData.invoiceNumber,
            itemsDescription: formData.itemsDescription,
            totalAmount: parseFloat(formData.totalAmount) || 0,
            fileDataUrl: invoiceToEdit ? invoiceToEdit.fileDataUrl : '',
            fileType: invoiceToEdit ? invoiceToEdit.fileType : 'manual',
            fileName: invoiceToEdit ? invoiceToEdit.fileName : 'Registro Manual',
        };

        onSave(newInvoice);
        onClose();
    };

    return {
        formData,
        setFormData,
        suggestions,
        handleInputChange,
        handleSupplierChange,
        selectSupplier,
        handleSubmit
    };
};
