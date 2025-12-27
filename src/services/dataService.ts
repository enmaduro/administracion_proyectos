import { ProjectInfo, Invoice, Phase, HistoryEntry, ChatEntry, BudgetItem } from '../types';
import { saveAs } from 'file-saver';

export interface ProjectDataBackup {
    version: number;
    timestamp: string;
    projectInfo: ProjectInfo;
    invoices: Invoice[];
    phases: Phase[];
    history: HistoryEntry[];
    chatHistory: ChatEntry[];
    budgetItems?: BudgetItem[];
}

export const exportProjectData = (
    projectInfo: ProjectInfo,
    invoices: Invoice[],
    phases: Phase[],
    history: HistoryEntry[],
    chatHistory: ChatEntry[],
    budgetItems: BudgetItem[] = []
): void => {
    const backup: ProjectDataBackup = {
        version: 1,
        timestamp: new Date().toISOString(),
        projectInfo,
        invoices,
        phases,
        history,
        chatHistory,
        budgetItems
    };

    const dataStr = JSON.stringify(backup, null, 2);
    // Use explicit MIME type for JSON to ensure proper handling
    const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });

    const safeName = (projectInfo.communityName || 'proyecto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `respaldo_${safeName}_${dateStr}.json`;

    // Use FileSaver.js for reliable cross-browser downloads with correct extensions
    saveAs(blob, fileName);
};

export const validateAndParseBackup = async (file: File): Promise<ProjectDataBackup> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const parsed = JSON.parse(result);

                // Basic structural validation
                if (!parsed.projectInfo || !Array.isArray(parsed.invoices)) {
                    throw new Error("El archivo no tiene el formato correcto de respaldo.");
                }

                resolve(parsed as ProjectDataBackup);
            } catch (err) {
                reject(new Error("Error al leer el archivo de respaldo. Asegúrese de que sea un archivo .json válido generado por esta aplicación."));
            }
        };
        reader.onerror = () => reject(new Error("Error de lectura del archivo."));
        reader.readAsText(file);
    });
};
