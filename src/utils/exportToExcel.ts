import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Invoice, Phase, ProjectInfo } from '@/types';

export const exportToExcel = (
    invoices: Invoice[],
    phases: Phase[],
    projectInfo: ProjectInfo
) => {
    if (!invoices || invoices.length === 0) {
        alert("No hay facturas para exportar.");
        return;
    }

    const phaseMap = new Map(phases.map(p => [p.id, p.name]));

    // 1. Preparar datos planos para Excel
    const data = invoices.map(inv => ({
        Fecha: inv.invoiceDate,
        Proveedor: inv.supplierName,
        RIF: inv.rif,
        'Nro. Factura': inv.invoiceNumber,
        Descripción: inv.itemsDescription,
        'Monto Total': Number(inv.totalAmount) || 0,
        'Fase Asignada': inv.phaseId ? phaseMap.get(inv.phaseId) || 'N/A' : 'Sin Asignar',
    }));

    // 2. Crear libro y hoja
    const wb = XLSX.utils.book_new();

    // Cabeceras personalizadas
    const wsData = [
        [`Proyecto: ${projectInfo.communityName}`],
        [`Consulta: ${projectInfo.consultationNumber} / Año: ${projectInfo.year}`],
        [''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.sheet_add_json(ws, data, { origin: 'A4' });

    // 3. Anchos de columna
    const wscols = [
        { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 },
    ];
    ws['!cols'] = wscols;

    // 4. Guardar
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    const safeName = projectInfo.communityName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const fileName = `Reporte_Gastos_${safeName}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, fileName);
};
