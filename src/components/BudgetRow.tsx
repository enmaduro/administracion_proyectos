import React from 'react';
import { BudgetItem } from '../types';

interface BudgetRowProps {
    item: BudgetItem;
    isBestPrice: boolean;
    currencySymbol: string;
    onEdit: () => void;
    onDelete: () => void;
}

export const BudgetRow: React.FC<BudgetRowProps> = ({
    item,
    isBestPrice,
    currencySymbol,
    onEdit,
    onDelete
}) => {
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
                    <button onClick={onEdit} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button onClick={onDelete} className="text-red-600 hover:text-red-900 dark:hover:text-red-400" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </td>
        </tr>
    );
};
