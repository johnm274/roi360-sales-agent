export interface Partner {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
    sectors: string[] | null;
    strengths: string | null;
    notes: string | null;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PartnerContextEntry {
    id: string;
    partnerId: string;
    contextKey: string;
    contextValue: string;
    source: string | null;
    createdAt: string;
    updatedAt: string;
}
