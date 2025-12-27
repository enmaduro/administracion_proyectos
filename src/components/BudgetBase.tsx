import React, { useState, useMemo } from 'react';
import { BudgetItem } from '../types';

interface BudgetBaseProps {
    items: BudgetItem[];
    onAddItem: (item: BudgetItem) => void;
    onUpdateItem: (item: BudgetItem) => void;
    onDeleteItem: (itemId: string) => void;
    currencySymbol?: string;
}

const BudgetBase: React.FC<BudgetBaseProps> = ({
    items,
    onAddItem,
    onUpdateItem, // Keeping for future inline editing or modal editing
    onDeleteItem,
    currencySymbol = 'Bs.'
}) => {
    // Form State
    // Use strings for numeric inputs to allow empty values and avoid "0" sticking
    const [newItem, setNewItem] = useState<{
        item: string;
        description: string;
        provider: string;
        unit: string;
        quantity: string;
        unitPrice: string;
    }>({
        item: '',
        description: '',
        provider: '',
        unit: 'und',
        quantity: '1',
        unitPrice: ''
    });

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (item: BudgetItem) => {
        setEditingId(item.id);
        setNewItem({
            item: item.item,
            description: item.description,
            provider: item.provider,
            unit: item.unit,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString()
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewItem({
            item: '',
            description: '',
            provider: '',
            unit: 'und',
            quantity: '1',
            unitPrice: ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.item || !newItem.provider) return;

        if (editingId) {
            // Update existing
            const updatedItem: BudgetItem = {
                id: editingId,
                item: newItem.item!,
                description: newItem.description || '',
                provider: newItem.provider,
                unit: newItem.unit || 'und',
                quantity: parseFloat(newItem.quantity) || 0,
                unitPrice: parseFloat(newItem.unitPrice) || 0
            };
            onUpdateItem(updatedItem);
            setEditingId(null);
        } else {
            // Add new
            const itemToAdd: BudgetItem = {
                id: Date.now().toString(),
                item: newItem.item!,
                description: newItem.description || '',
                provider: newItem.provider,
                unit: newItem.unit || 'und',
                quantity: parseFloat(newItem.quantity) || 0,
                unitPrice: parseFloat(newItem.unitPrice) || 0
            };
            onAddItem(itemToAdd);
        }

        // Reset form but keep some useful defaults like unit
        setNewItem({
            item: '',
            description: '',
            provider: '',
            unit: 'und',
            quantity: '1',
            unitPrice: ''
        });
    };

    // Calculation Logic
    const bestPrices = useMemo(() => {
        const prices: Record<string, number> = {};
        items.forEach(i => {
            const normalizedItem = i.item.trim().toLowerCase();
            if (!prices[normalizedItem] || i.unitPrice < prices[normalizedItem]) {
                prices[normalizedItem] = i.unitPrice;
            }
        });
        return prices;
    }, [items]);

    const totalBudget = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }, [items]);

    // Autocomplete Data
    const uniqueItems = useMemo(() => Array.from(new Set(items.map(i => i.item))), [items]);
    const uniqueProviders = useMemo(() => Array.from(new Set(items.map(i => i.provider))), [items]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 36v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Presupuesto Base y Estimaciones
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item / Material</label>
                        <input
                            type="text"
                            name="item"
                            value={newItem.item}
                            onChange={handleInputChange}
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
                            value={newItem.description}
                            onChange={handleInputChange}
                            placeholder="Detalles técnicos..."
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                        <input
                            type="text"
                            name="provider"
                            value={newItem.provider}
                            onChange={handleInputChange}
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
                            value={newItem.unit}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cant.</label>
                        <input
                            type="number"
                            name="quantity"
                            value={newItem.quantity}
                            onChange={handleInputChange}
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
                            value={newItem.unitPrice}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                        <button
                            type="submit"
                            className={`w-full text-white font-bold py-2 px-3 rounded-lg transition duration-300 flex justify-center items-center ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                            title={editingId ? "Actualizar Item" : "Agregar al Presupuesto"}
                        >
                            {editingId ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            )}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
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
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Proveedor</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cant.</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P. Unit</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>

                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No hay items en el presupuesto aún. Agrega el primero arriba.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => {
                                    const isBestPrice = item.unitPrice === bestPrices[item.item.trim().toLowerCase()] && item.unitPrice > 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {item.item}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 relative">
                                                {item.provider}
                                                {isBestPrice && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Mejor Precio
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                                                {item.quantity} {item.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                                                {currencySymbol} {item.unitPrice.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                                                {currencySymbol} {(item.quantity * item.unitPrice).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
                                                        title="Editar Item"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteItem(item.id)}
                                                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors"
                                                        title="Eliminar Item"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                            <tr>
                                <td colSpan={5} className="px-6 py-3 text-right text-base text-gray-900 dark:text-white uppercase tracking-wider">
                                    Total Presupuesto Estimado:
                                </td>
                                <td className="px-6 py-3 text-right text-base text-blue-600 dark:text-blue-400 ">
                                    {currencySymbol} {totalBudget.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BudgetBase;
