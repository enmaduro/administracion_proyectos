import { useMemo } from 'react';
import { Invoice, Phase, BudgetItem } from '@/types';

interface UseProjectSummaryProps {
    invoices: Invoice[];
    phases: Phase[];
    budgetItems?: BudgetItem[];
}

export const useProjectSummary = ({ invoices, phases, budgetItems = [] }: UseProjectSummaryProps) => {
    const summaryData = useMemo(() => {
        // ... (Invoice Logic remains the same)
        const validInvoices = Array.isArray(invoices) ? invoices.filter(inv => inv && typeof inv === 'object') : [];
        const validPhases = Array.isArray(phases) ? phases.filter(p => p && typeof p === 'object') : [];

        const phaseMap = new Map<string, { details: Phase; invoices: Invoice[]; total: number }>(
            validPhases.map(p => [p.id, { details: p, invoices: [], total: 0 }])
        );
        const unassignedInvoices: Invoice[] = [];
        let unassignedTotal = 0;

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

        // Budget Logic
        const validBudgetItems = Array.isArray(budgetItems) ? budgetItems : [];
        const budgetTotal = validBudgetItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        // Group budget by provider for analysis
        const providerGroups: Record<string, { items: BudgetItem[], total: number }> = {};
        validBudgetItems.forEach(item => {
            if (!providerGroups[item.provider]) {
                providerGroups[item.provider] = { items: [], total: 0 };
            }
            providerGroups[item.provider].items.push(item);
            providerGroups[item.provider].total += (item.quantity * item.unitPrice);
        });

        return {
            phaseGroups,
            unassignedGroup: {
                invoices: unassignedInvoices,
                total: unassignedTotal,
                percentage: grandTotal > 0 ? (unassignedTotal / grandTotal) * 100 : 0,
            },
            grandTotal,
            totalInvoices: validInvoices.length,
            budgetTotal,
            providerGroups: Object.entries(providerGroups).map(([name, data]) => ({ name, ...data })),
            totalBudgetItems: validBudgetItems.length
        };
    }, [invoices, phases, budgetItems]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
    };

    return {
        summaryData,
        formatCurrency
    };
};
