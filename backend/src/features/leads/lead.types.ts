export type Lead = {
    id: string;
    userId: string;
    company: string;
    website: string | null;
    domain: string | null;
    industry: string | null;
    productServiceCategory: string | null;
    businessType: string | null;
    employees: number | null;
    revenue: number | null;
    yearFounded: number | null;
    bbbRating: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    companyPhone: string | null;
    companyLinkedin: string | null;
    ownerFirstName: string | null;
    ownerLastName: string | null;
    ownerTitle: string | null;
    ownerLinkedin: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    technologies: string[];
    funding: string | null;
    hiringSignals: string | null;
    recentNews: string | null;
    growthSignals: string[];
};

export type LeadInput = Omit<Lead, "id" | "userId"> & { userId?: string };

export type LeadScore = {
    leadId: string;
    icpId: string;
    totalScore: number;
    industryFit: number;
    companySizeFit: number;
    revenuePotential: number;
    growthSignals: number;
    contactability: number;
    decisionMakerFit: number;
    dataQuality: number;
    recommendedAction: string;
    aiExplanation?: string | null;
    aiGeneratedAt?: string | null;
    reasons: string[];
    concerns: string[];
};

export type RankedLead = Lead & { score: LeadScore | null };
