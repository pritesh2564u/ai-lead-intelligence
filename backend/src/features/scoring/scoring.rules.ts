import type { ICP } from "../icp/icp.types.js";
import type { Lead, LeadScore } from "../leads/lead.types.js";

export const scoringWeights = {
    industryFit: 0.2,
    companySizeFit: 0.15,
    revenuePotential: 0.15,
    growthSignals: 0.15,
    contactability: 0.15,
    decisionMakerFit: 0.1,
    dataQuality: 0.1,
} as const;

const relatedIndustries: Record<string, string[]> = {
    hvac: [
        "plumbing",
        "electrical",
        "construction",
        "facilities",
        "home services",
        "mechanical",
    ],
    software: ["saas", "technology", "it services"],
    healthcare: [
        "medical",
        "dental",
        "wellness",
        "health",
        "hospital",
        "clinic",
        "physician",
        "doctor",
        "nurse",
        "pharmacy",
        "urgent care",
    ],
};

const lc = (value?: string | null) => value?.toLowerCase().trim() ?? "";

export const scoreIndustryFit = (lead: Lead, icp: ICP): number => {
    const industry = lc(lead.industry);
    const target = lc(icp.industry);
    if (!industry || !target) return 30;
    if (icp.excludedIndustries.map(lc).includes(industry)) return 0;
    if (industry.includes(target) || target.includes(industry)) return 100;
    if (
        (relatedIndustries[target] ?? []).some((item) =>
            industry.includes(item),
        )
    )
        return 75;
    if (
        icp.keywords
            .map(lc)
            .some(
                (keyword) =>
                    industry.includes(keyword) ||
                    lc(lead.productServiceCategory).includes(keyword),
            )
    )
        return 40;
    return 0;
};

export const scoreRangeFit = (
    value: number | null,
    min: number | null,
    max: number | null,
): number => {
    if (value === null || (!min && !max)) return 45;
    if ((min === null || value >= min) && (max === null || value <= max))
        return 100;
    const lower = min ?? 0;
    const upper = max ?? Math.max(value, lower);
    const band = Math.max(1, upper - lower);
    const distance = value < lower ? lower - value : value - upper;
    if (distance <= band * 0.35) return 70;
    return 30;
};

export const scoreGrowthSignals = (lead: Lead, icp: ICP): number => {
    const signals = [
        ...lead.growthSignals,
        lead.hiringSignals,
        lead.funding,
        lead.recentNews,
    ]
        .filter(Boolean)
        .map((item) => lc(item));
    if (!signals.length) return 20;
    const preferred = icp.growthPreferences.map(lc);
    const preferredHits = signals.filter((signal) =>
        preferred.some((pref) => signal.includes(pref)),
    ).length;
    return Math.min(100, 45 + signals.length * 15 + preferredHits * 20);
};

export const scoreContactability = (lead: Lead): number => {
    const hasEmail = Boolean(lead.ownerEmail);
    const hasPhone = Boolean(lead.ownerPhone || lead.companyPhone);
    const hasLinkedin = Boolean(lead.ownerLinkedin || lead.companyLinkedin);
    if (hasEmail && hasPhone && hasLinkedin) return 100;
    if (hasEmail && hasLinkedin) return 80;
    if (hasEmail) return 60;
    if (hasPhone) return 40;
    return 0;
};

export const scoreDecisionMaker = (lead: Lead, icp: ICP): number => {
    const title = lc(lead.ownerTitle);
    if (!title) return 0;
    if (icp.targetTitles.map(lc).some((target) => title.includes(target)))
        return 100;
    if (
        /(owner|founder|ceo|president|principal|partner|director|vp)/.test(
            title,
        )
    )
        return 75;
    return 40;
};

export const scoreDataQuality = (lead: Lead): number => {
    const fields = [
        lead.company,
        lead.domain,
        lead.industry,
        lead.city || lead.state,
        lead.employees,
        lead.revenue,
        lead.ownerEmail || lead.ownerPhone,
        lead.ownerTitle,
        lead.website,
        lead.growthSignals.length ? lead.growthSignals.join(",") : null,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

export const calculateOpportunityScore = (lead: Lead, icp: ICP): LeadScore => {
    const parts = {
        industryFit: scoreIndustryFit(lead, icp),
        companySizeFit: scoreRangeFit(
            lead.employees,
            icp.minEmployees,
            icp.maxEmployees,
        ),
        revenuePotential: scoreRangeFit(
            lead.revenue,
            icp.minRevenue,
            icp.maxRevenue,
        ),
        growthSignals: scoreGrowthSignals(lead, icp),
        contactability: scoreContactability(lead),
        decisionMakerFit: scoreDecisionMaker(lead, icp),
        dataQuality: scoreDataQuality(lead),
    };
    const totalScore = Math.round(
        Object.entries(parts).reduce(
            (sum, [key, value]) =>
                sum +
                value * scoringWeights[key as keyof typeof scoringWeights],
            0,
        ),
    );
    const reasons = [
        parts.industryFit >= 75 ? "Strong industry fit" : null,
        parts.companySizeFit >= 70 ? "Good employee range fit" : null,
        parts.contactability >= 60 ? "Actionable contact data available" : null,
        parts.decisionMakerFit >= 75 ? "Decision maker identified" : null,
        parts.growthSignals >= 60 ? "Growth activity detected" : null,
    ].filter(Boolean) as string[];
    const concerns = [
        parts.industryFit === 0 ? "Industry does not match the ICP" : null,
        parts.dataQuality < 50 ? "Important lead fields are missing" : null,
        parts.contactability === 0
            ? "No direct contact channel is available"
            : null,
    ].filter(Boolean) as string[];
    return {
        leadId: lead.id,
        icpId: icp.id,
        totalScore,
        ...parts,
        recommendedAction:
            parts.contactability >= 80
                ? "Contact decision maker"
                : parts.contactability >= 40
                  ? "Verify contact details"
                  : "Research contact first",
        reasons,
        concerns,
    };
};
