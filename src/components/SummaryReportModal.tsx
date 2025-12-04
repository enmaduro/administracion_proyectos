import React, { useMemo, useEffect } from 'react';
import { ProjectInfo, Invoice, Phase } from '../types.ts';
import { PrintIcon } from './icons.tsx';

interface SummaryReportModalProps {
  projectInfo: ProjectInfo;
  invoices: Invoice[];
  phases: Phase[];
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
};

const SummaryReportModal: React.FC<SummaryReportModalProps> = ({ projectInfo, invoices, phases, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
          onClose();
       }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const summaryData = useMemo(() => {
    // Comprobaciones defensivas: Si las props no son arrays, se tratan como arrays vacíos para evitar errores.
    const validInvoices = Array.isArray(invoices) ? invoices.filter(inv => inv && typeof inv === 'object') : [];
    const validPhases = Array.isArray(phases) ? phases.filter(p => p && typeof p === 'object') : [];

    const phaseMap = new Map<string, { details: Phase; invoices: Invoice[]; total: number }>(
      validPhases.map(p => [p.id, { details: p, invoices: [], total: 0 }])
    );
    const unassignedInvoices: Invoice[] = [];
    let unassignedTotal = 0;
    
    // Se usa 'validInvoices' y se asegura que totalAmount sea un número.
    const grandTotal = validInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

    for (const invoice of validInvoices) {
      const amount = Number(invoice.totalAmount) || 0;
      if (invoice.phaseId && phaseMap.has(invoice.phaseId)) {
        const phaseGroup = phaseMap.get(invoice.phaseId)!;
        phaseGroup.invoices.push(invoice);
        phaseGroup.total += amount;
      } else {
        unassignedInvoices.push(invoice);
        unassignedTotal += amount;
      }
    }

    const phaseGroups = Array.from(phaseMap.values()).map(group => ({
      ...group,
      percentage: grandTotal > 0 ? (group.total / grandTotal) * 100 : 0,
    }));
    
    const unassignedGroup = {
      invoices: unassignedInvoices,
      total: unassignedTotal,
      percentage: grandTotal > 0 ? (unassignedTotal / grandTotal) * 100 : 0,
    };

    return {
      phaseGroups,
      unassignedGroup,
      grandTotal,
      totalInvoices: validInvoices.length,
    };
  }, [invoices, phases]);

  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #summary-report-content, #summary-report-content * { visibility: visible; }
        #summary-report-content {
          position: absolute; left: 0; top: 0; width: 100%; height: auto;
          margin: 0; padding: 1.5rem; box-shadow: none !important;
          border-radius: 0 !important; border: none !important;
          background-color: white !important;
        }
        #summary-report-content *, #summary-report-content h1, #summary-report-content p, #summary-report-content h3, #summary-report-content h4 {
            color: black !important;
        }
        .print-hidden { display: none !important; }
        @page { size: auto; margin: 0.5in; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        thead { background-color: #f2f2f2 !important; -webkit-print-color-adjust: exact; }
      }
    `;
    
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        id="summary-report-content"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 print-hidden">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                Resumen General del Proyecto
            </h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="p-4 md:p-6 flex-grow overflow-auto">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{projectInfo.communityName}</h1>
                <p className="text-gray-600 dark:text-gray-400">Proyecto Nro. {projectInfo.consultationNumber} / Año {projectInfo.year}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gasto Total del Proyecto</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryData.grandTotal)}</p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total de Facturas Registradas</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{summaryData.totalInvoices}</p>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Desglose por Fase</h3>
            <div className="space-y-6">
              {summaryData.phaseGroups.map(group => (
                group.invoices.length > 0 && (
                  <div key={group.details.id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-t-lg">
                      <h4 className="font-bold text-lg text-gray-800 dark:text-white">{group.details.name}</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th className="px-4 py-2">Fecha</th>
                            <th className="px-4 py-2">Proveedor</th>
                            <th className="px-4 py-2">Nro. Factura</th>
                            <th className="px-4 py-2">Descripción</th>
                            <th className="px-4 py-2 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {group.invoices.map(invoice => (
                            <tr key={invoice.id}>
                              <td className="px-4 py-2 whitespace-nowrap">{invoice.invoiceDate}</td>
                              <td className="px-4 py-2">{invoice.supplierName}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{invoice.invoiceNumber}</td>
                              <td className="px-4 py-2 max-w-xs truncate" title={invoice.itemsDescription}>{invoice.itemsDescription}</td>
                              <td className="px-4 py-2 text-right font-mono">{formatCurrency(invoice.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-end items-baseline gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{group.invoices.length} {group.invoices.length === 1 ? 'factura' : 'facturas'}</span>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white font-mono">{formatCurrency(group.total)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{group.percentage.toFixed(1)}% del total</p>
                        </div>
                    </div>
                  </div>
                )
              ))}
              {summaryData.unassignedGroup.invoices.length > 0 && (
                 <div className="border border-dashed border-gray-300 dark:border-gray-500 rounded-lg">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-t-lg">
                      <h4 className="font-bold text-lg text-gray-600 dark:text-gray-300">Facturas Sin Asignar</h4>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                           <tr>
                            <th className="px-4 py-2">Fecha</th>
                            <th className="px-4 py-2">Proveedor</th>
                            <th className="px-4 py-2">Nro. Factura</th>
                            <th className="px-4 py-2">Descripción</th>
                            <th className="px-4 py-2 text-right">Monto</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                           {summaryData.unassignedGroup.invoices.map(invoice => (
                             <tr key={invoice.id}>
                               <td className="px-4 py-2 whitespace-nowrap">{invoice.invoiceDate}</td>
                               <td className="px-4 py-2">{invoice.supplierName}</td>
                               <td className="px-4 py-2 whitespace-nowrap">{invoice.invoiceNumber}</td>
                               <td className="px-4 py-2 max-w-xs truncate" title={invoice.itemsDescription}>{invoice.itemsDescription}</td>
                               <td className="px-4 py-2 text-right font-mono">{formatCurrency(invoice.totalAmount)}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                     <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-end items-baseline gap-4">
                         <span className="text-sm text-gray-500 dark:text-gray-400">{summaryData.unassignedGroup.invoices.length} {summaryData.unassignedGroup.invoices.length === 1 ? 'factura' : 'facturas'}</span>
                         <div className="text-right">
                            <p className="font-semibold text-gray-700 dark:text-gray-200 font-mono">{formatCurrency(summaryData.unassignedGroup.total)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{summaryData.unassignedGroup.percentage.toFixed(1)}% del total</p>
                         </div>
                     </div>
                 </div>
              )}
            </div>
        </div>

        <div className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-gray-700 space-x-4 print-hidden">
            <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors"
            >
                <PrintIcon />
                Imprimir
            </button>
            <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
            >
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryReportModal;