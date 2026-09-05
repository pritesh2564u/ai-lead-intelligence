export type ICP = {
    id: string;
    userId: string;
    name: string;
    industry: string;
    locations: string[];
    minEmployees: number | null;
    maxEmployees: number | null;
    minRevenue: number | null;
    maxRevenue: number | null;
    businessType: string | null;
    targetTitles: string[];
    keywords: string[];
    excludedIndustries: string[];
    growthPreferences: string[];
};

export type ICPInput = Omit<ICP, "id" | "userId"> & { userId?: string };
