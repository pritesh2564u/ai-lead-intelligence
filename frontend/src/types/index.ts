export type ICP = {
    id: string;
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

export type LeadScore = {
    totalScore: number;
    industryFit: number;
    companySizeFit: number;
    revenuePotential: number;
    growthSignals: number;
    contactability: number;
    decisionMakerFit: number;
    dataQuality: number;
    recommendedAction: string;
    reasons: string[];
    concerns: string[];
};

export type Lead = {
    id: string;
    company: string;
    website: string | null;
    domain: string | null;
    industry: string | null;
    businessType: string | null;
    employees: number | null;
    revenue: number | null;
    city: string | null;
    state: string | null;
    companyPhone: string | null;
    companyLinkedin: string | null;
    ownerFirstName: string | null;
    ownerLastName: string | null;
    ownerTitle: string | null;
    ownerLinkedin: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    growthSignals: string[];
    score: LeadScore | null;
};
