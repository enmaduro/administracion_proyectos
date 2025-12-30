import React, { useState, useEffect } from 'react';
import { BudgetItem } from '@/types';

interface BudgetFormProps {
    itemToEdit: BudgetItem | null;
    onCancelEdit: () => void;
    onSubmit: (data: Partial<BudgetItem>) => void;
    uniqueItems: string[];
    uniqueProviders: string[];
}

const BudgetForm: React.FC<BudgetFormProps> = ({
    itemToEdit,
    onCancelEdit,
    onSubmit,
    uniqueItems,
    uniqueProviders
}) => {
    // Estado local controlado por el formulario
    const [formData, setFormData] = useState({
        item: '',
        description: '',
        provider: '',
        unit: 'und',
        quantity: '1',
        unitPrice: ''
    });

    // Si cambia el item a editar, reseteamos el formulario
    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                item: itemToEdit.item,
                description: itemToEdit.description,
                provider: itemToEdit.provider,
                unit: itemToEdit.unit,
                quantity: itemToEdit.quantity.toString(),
                unitPrice: itemToEdit.unitPrice.toString()
            });
        } else {
            // Reset a limpio si no estamos editando
            setFormData({
                item: '', description: '', provider: '', unit: 'und', quantity: '1', unitPrice: ''
            });
        }
    }, [itemToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.item || !formData.provider) return;

        onSubmit({
            item: formData.item,
            description: formData.description,
            provider: formData.provider,
            unit: formData.unit || 'und',
            quantity: parseFloat(formData.quantity) || 0,
            unitPrice: parseFloat(formData.unitPrice) || 0
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item / Material</label>
                <input
                    type="text"
                    name="item"
                    value={formData.item}
                    onChange={handleChange}
                    placeholder="Ej. Cemento, Cabillas..."
                    list="items-list"
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                    required
                />
                <datalist id="items-list">
                    {uniqueItems.map(item => <option key={item} value={item} />)}
                </datalist>
            </div>
            <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detalles técnicos..."
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    placeholder="Nombre del proveedor"
                    list="providers-list"
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                    required
                />
                <datalist id="providers-list">
                    {uniqueProviders.map(provider => <option key={provider} value={provider} />)}
                </datalist>
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidad</label>
                <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                />
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cant.</label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                />
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">P. Unit</label>
                <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                />
            </div>
            <div className="md:col-span-1 flex items-end">
                <button
                    type="submit"
                    className={`w-full text-white font-bold py-2 px-3 rounded-lg transition duration-300 flex justify-center items-center ${itemToEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    title={itemToEdit ? "Actualizar Item" : "Agregar al Presupuesto"}
                >
                    {itemToEdit ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    )}
                </button>
                {itemToEdit && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="ml-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition duration-300 flex justify-center items-center"
                        title="Cancelar Edición"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </form>
    );
};

export default BudgetForm;
