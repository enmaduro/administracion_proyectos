import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProjectInfo, Invoice, Phase, BudgetItem } from '@/types';
import { PrintIcon } from './icons';
import { useProjectSummary } from '@hooks/useProjectSummary';

interface SummaryReportModalProps {
  projectInfo: ProjectInfo;
  invoices: Invoice[];
  phases: Phase[];
  budgetItems?: BudgetItem[];
  mode?: 'invoices' | 'budget';
  onClose: () => void;
}

const SummaryReportModal: React.FC<SummaryReportModalProps> = ({
  projectInfo,
  invoices,
  phases,
  budgetItems = [],
  mode = 'invoices',
  onClose
}) => {
  const { summaryData, formatCurrency } = useProjectSummary({ invoices, phases, budgetItems });
  
  const [viewMode, setViewMode] = useState<'invoices' | 'budget'>(mode);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div
      id="summary-report-portal"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-2 md:p-8 pt-12 overflow-y-auto transition-opacity"
      onClick={onClose}
    >
      {/* HOJA DE REPORTE */}
      <div
        id="report-paper"
        className="bg-white max-w-[8.5in] w-full min-h-[11in] shadow-2xl flex flex-col relative mx-auto transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BARRA DE HERRAMIENTAS (No se imprime) */}
        <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-white no-print sticky top-0 z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('invoices')}
              className={`text-xs font-bold px-3 py-1 rounded transition-colors ${viewMode === 'invoices' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Ver Gastos (Facturas)
            </button>
            <button
              onClick={() => setViewMode('budget')}
              className={`text-xs font-bold px-3 py-1 rounded transition-colors ${viewMode === 'budget' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Ver Presupuesto
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-1 bg-slate-800 text-white text-xs rounded hover:bg-slate-700 transition shadow"
            >
              <PrintIcon />
              <span className="ml-1">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL DOCUMENTO */}
        <div className="flex-grow p-6 md:p-8 flex flex-col">
          
          {/* ENCABEZADO FORMAL */}
          <div className="mb-4 border-b border-slate-400 pb-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Ministerio del Poder Popular / Comunidad</div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">
                  REPORTE DE GESTIÓN
                </h1>
                <p className="text-lg font-bold text-slate-800 mt-1">{projectInfo.communityName}</p>
                <p className="text-xs text-slate-500">ID: {projectInfo.consultationNumber} / AÑO {projectInfo.year}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Fecha Emisión</p>
                <p className="text-sm font-mono font-bold text-slate-800">{new Date().toLocaleDateString('es-VE')}</p>
              </div>
            </div>
            <div className="mt-1 inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase border border-slate-300">
              {viewMode === 'budget' ? 'Presupuesto Estimado' : 'Ejecución de Gastos'}
            </div>
          </div>

          {/* CUADROS DE RESUMEN */}
          {viewMode === 'budget' ? (
             // PRESUPUESTO
             <div className="mb-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-2 border border-slate-300 bg-slate-50">
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Total Estimado</p>
                  <p className="text-lg font-black text-slate-900 font-mono">{formatCurrency(summaryData.budgetTotal)}</p>
                </div>
                <div className="p-2 border border-slate-300 bg-slate-50">
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Cant. Items</p>
                  <p className="text-lg font-black text-slate-900 font-mono">{summaryData.totalBudgetItems}</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase">Desglose de Partidas</h3>
              <div className="w-full overflow-hidden border border-slate-400">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-1.5 text-left border-b border-slate-300">Descripción / Rubro</th>
                      <th className="p-1.5 text-left border-b border-slate-300">Proveedor</th>
                      <th className="p-1.5 text-right border-b border-slate-300">Cant.</th>
                      <th className="p-1.5 text-right border-b border-slate-300">Precio Unit.</th>
                      <th className="p-1.5 text-right border-b border-slate-300">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {budgetItems.map(item => (
                      <tr key={item.id}>
                        <td className="p-1.5 text-slate-700">
                          <span className="block font-bold text-[10px]">{item.item}</span>
                          <span className="block text-[9px] text-gray-500 truncate max-w-[150px] block">{item.description}</span>
                        </td>
                        <td className="p-1.5 text-slate-700 text-[10px]">{item.provider}</td>
                        <td className="p-1.5 text-right font-mono">{item.quantity} {item.unit}</td>
                        <td className="p-1.5 text-right font-mono text-slate-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-1.5 text-right font-bold font-mono text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-black border-t-2 border-slate-400">
                    <tr>
                      <td colSpan={4} className="p-1.5 text-right text-slate-800 text-[10px] uppercase">Total Estimado</td>
                      <td className="p-1.5 text-right text-slate-900 font-mono">{formatCurrency(summaryData.budgetTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
             </div>
          ) : (
             // GASTOS
             <div className="mb-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 border-l-4 border-orange-600 bg-slate-50 shadow-sm">
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Ejecutado</p>
                  <p className="text-lg font-black text-slate-900 font-mono">{formatCurrency(summaryData.grandTotal)}</p>
                </div>
                <div className="p-2 border border-slate-300 bg-slate-50">
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Total Facturas</p>
                  <p className="text-lg font-black text-slate-900 font-mono">{summaryData.totalInvoices}</p>
                </div>
              </div>

              {/* NUEVA SECCIÓN: RESUMEN POR FASES */}
              {summaryData.phaseGroups.length > 0 && (
                 <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase">2a. Resumen de Ejecución por Fase</h3>
                    <table className="w-full text-[11px] border border-slate-400">
                      <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-1.5 text-left border-b border-slate-300">Nombre de la Fase</th>
                          <th className="p-1.5 text-right border-b border-slate-300">Monto Subtotal</th>
                          <th className="p-1.5 text-right border-b border-slate-300">Porcentaje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {summaryData.phaseGroups.map(group => (
                          <tr key={group.details.id}>
                            <td className="p-1.5 font-medium text-slate-700">{group.details.name}</td>
                            <td className="p-1.5 text-right font-mono font-bold text-slate-900">{formatCurrency(group.total)}</td>
                            <td className="p-1.5 text-right font-mono text-slate-600">{group.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                        {/* Gastos sin Clasificar */}
                        {summaryData.unassignedGroup.invoices.length > 0 && (
                           <tr>
                            <td className="p-1.5 font-medium text-slate-500 italic">Sin Clasificar</td>
                            <td className="p-1.5 text-right font-mono text-slate-700">{formatCurrency(summaryData.unassignedGroup.total)}</td>
                            <td className="p-1.5 text-right font-mono text-slate-500">-</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-slate-50 font-black border-t-2 border-slate-400">
                        <tr>
                          <td className="p-1.5 text-right text-slate-800 text-[10px] uppercase font-bold">Total Ejecutado</td>
                          <td className="p-1.5 text-right text-slate-900 font-mono text-sm">{formatCurrency(summaryData.grandTotal)}</td>
                          <td className="p-1.5 text-right text-slate-900 font-mono">100%</td>
                        </tr>
                      </tfoot>
                    </table>
                 </div>
              )}

              {/* DETALLE DE FACTURAS */}
              <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase">2b. Detalle Individual de Facturas</h3>
              <div className="space-y-3">
                {summaryData.phaseGroups.map(group => (
                  group.invoices.length > 0 && (
                    <div key={group.details.id} className="break-inside-avoid">
                      <div className="flex justify-between items-end mb-1 border-b border-slate-300">
                        <span className="font-bold text-slate-800 text-[11px]">{group.details.name}</span>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">{formatCurrency(group.total)}</span>
                      </div>
                      <table className="w-full text-[11px] mb-1">
                        <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-[9px]">
                          <tr>
                            <th className="p-1 text-left">Fecha</th>
                            <th className="p-1 text-left">Proveedor</th>
                            <th className="p-1 text-left">Nro.</th>
                            <th className="p-1 text-left">Descripción</th>
                            <th className="p-1 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {group.invoices.map(invoice => (
                            <tr key={invoice.id} className="text-slate-700">
                              <td className="p-1 text-[9px]">{invoice.invoiceDate}</td>
                              <td className="p-1 text-[10px] font-medium">{invoice.supplierName}</td>
                              <td className="p-1 text-[9px] font-mono">{invoice.invoiceNumber}</td>
                              <td className="p-1 text-[9px] text-gray-500 truncate max-w-[100px] block">{invoice.itemsDescription}</td>
                              <td className="p-1 text-right font-bold font-mono text-[10px]">{formatCurrency(invoice.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ))}

                {/* TABLA SIN CLASIFICAR DETALLE */}
                {summaryData.unassignedGroup.invoices.length > 0 && (
                  <div className="border border-dashed border-slate-400 rounded p-1 mt-2 bg-slate-50/50">
                    <div className="flex justify-between items-end mb-1 border-b border-slate-300">
                      <span className="font-bold text-slate-600 text-[11px]">Gastos Sin Clasificar</span>
                      <span className="font-mono font-bold text-slate-600 text-[11px]">{formatCurrency(summaryData.unassignedGroup.total)}</span>
                    </div>
                    <table className="w-full text-[11px]">
                      <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-[9px]">
                        <tr>
                          <th className="p-1 text-left">Fecha</th>
                          <th className="p-1 text-left">Proveedor</th>
                          <th className="p-1 text-left">Nro.</th>
                          <th className="p-1 text-left">Descripción</th>
                          <th className="p-1 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {summaryData.unassignedGroup.invoices.map(invoice => (
                          <tr key={invoice.id} className="text-slate-700">
                            <td className="p-1 text-[9px]">{invoice.invoiceDate}</td>
                            <td className="p-1 text-[10px] font-medium">{invoice.supplierName}</td>
                            <td className="p-1 text-[9px] font-mono">{invoice.invoiceNumber}</td>
                            <td className="p-1 text-[9px] text-gray-500 truncate max-w-[100px] block">{invoice.itemsDescription}</td>
                            <td className="p-1 text-right font-bold font-mono text-[10px]">{formatCurrency(invoice.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {summaryData.totalInvoices === 0 && (
                  <div className="text-center py-4 border border-dashed border-slate-300 rounded text-slate-500 text-sm">
                    No hay facturas registradas.
                  </div>
                )}
              </div>
             </div>
          )}

          {/* PIE DE FIRMA */}
          <div className="mt-auto pt-6 print:pt-12">
             <div className="grid grid-cols-2 gap-6">
                <div className="border-t border-slate-800 pt-1 text-center">
                  <p className="text-[10px] font-bold text-slate-800">Preparado por:</p>
                </div>
                <div className="border-t border-slate-800 pt-1 text-center">
                   <p className="text-[10px] font-bold text-slate-800">Aprobado por:</p>
                </div>
             </div>
             <div className="mt-4 text-center text-[9px] text-gray-400 font-mono">
               Generado por Gestor de Gastos Comunitarios v1.0 - {new Date().toLocaleString()}
             </div>
          </div>

        </div>
      </div>
    </div>
  );

  // ESTILOS DE IMPRESIÓN
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page { size: Letter; margin: 10mm; }
        body { background: white !important; }
        body > * { display: none !important; }
        #summary-report-portal {
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: white !important;
        }
        #report-paper {
          box-shadow: none !important;
          margin: 0 !important;
          max-width: 100% !important;
          min-height: auto !important;
          width: 100% !important;
          border: none !important;
        }
        .no-print { display: none !important; }
        #report-paper, #report-paper * {
          color: black !important;
          -webkit-print-color-adjust: exact !important; 
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return createPortal(modalContent, document.body);
};

export default SummaryReportModal;