export interface ProjectInfo {
    communityName: string;
    consultationNumber: string;
    year: string;
    budget?: number;
}

export interface Phase {
    id: string;
    name: string;
}

export interface Invoice {
    id: string;
    invoiceDate: string;
    supplierName: string;
    rif: string;
    invoiceNumber: string;
    itemsDescription: string;
    totalAmount: number;
    fileDataUrl: string;
    fileType: string;
    fileName: string;
    phaseId?: string;
}

export interface ProjectMetadata {
    id: string;
    name: string;
    createdAt: string;
    lastAccessed: string;
}

export interface HistoryEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'invoice' | 'phase' | 'project' | 'system';
}

export interface ChatEntry {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
}

export interface BudgetItem {
    id: string;
    item: string;
    description: string;
    provider: string;
    unit: string;
    quantity: number;
    unitPrice: number;
}