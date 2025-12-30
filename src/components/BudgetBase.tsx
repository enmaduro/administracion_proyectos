import React, { useMemo, useState } from 'react';
import { BudgetItem } from '@/types';
import BudgetForm from './BudgetForm';
import { BudgetRow } from './BudgetRow';

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
    onUpdateItem,
    onDeleteItem,
    currencySymbol = 'Bs.'
}) => {
    // Solo controlamos QUÉ item estamos editando, no los datos del formulario
    const [editingId, setEditingId] = useState<string | null>(null);

    // Cálculo de Estadísticas (Separado de la UI)
    const stats = useMemo(() => {
        const prices: Record<string, number> = {};
        items.forEach(i => {
            const normalized = i.item.trim().toLowerCase();
            if (!prices[normalized] || i.unitPrice < prices[normalized]) {
                prices[normalized] = i.unitPrice;
            }
        });
        const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        return { bestPrices: prices, total };
    }, [items]);

    // Autocompletado (Calculado en el padre, pasado al hijo)
    const uniqueItems = useMemo(() => Array.from(new Set(items.map(i => i.item))), [items]);
    const uniqueProviders = useMemo(() => Array.from(new Set(items.map(i => i.provider))), [items]);

    const itemToEdit = editingId ? (items.find(i => i.id === editingId) || null) : null;

    const handleFormSubmit = (data: Partial<BudgetItem>) => {
        if (editingId && itemToEdit) {
            // Actualizar
            onUpdateItem({ ...itemToEdit, ...data } as BudgetItem);
            setEditingId(null);
        } else {
            // Crear
            onAddItem({
                id: Date.now().toString(),
                ...data,
                item: data.item!,
                description: data.description || '',
                provider: data.provider!,
                unit: data.unit || 'und',
                quantity: data.quantity || 0,
                unitPrice: data.unitPrice || 0
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* --- SECCIÓN FORMULARIO --- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 36v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Presupuesto Base y Estimaciones
                </h2>

                <BudgetForm
                    itemToEdit={itemToEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onSubmit={handleFormSubmit}
                    uniqueItems={uniqueItems}
                    uniqueProviders={uniqueProviders}
                />
            </div>

            {/* --- SECCIÓN TABLA --- */}
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
                                items.map((item) => (
                                    <BudgetRow
                                        key={item.id}
                                        item={item}
                                        isBestPrice={item.unitPrice === stats.bestPrices[item.item.trim().toLowerCase()] && item.unitPrice > 0}
                                        currencySymbol={currencySymbol}
                                        onEdit={() => setEditingId(item.id)}
                                        onDelete={() => onDeleteItem(item.id)}
                                    />
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                            <tr>
                                <td colSpan={5} className="px-6 py-3 text-right text-base text-gray-900 dark:text-white uppercase tracking-wider">
                                    Total Presupuesto Estimado:
                                </td>
                                <td className="px-6 py-3 text-right text-base text-blue-600 dark:text-blue-400 ">
                                    {currencySymbol} {stats.total.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
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
