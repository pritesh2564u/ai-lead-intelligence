import { describe, expect, it } from "vitest";
import type { ICP } from "../icp/icp.types.js";
import type { Lead } from "../leads/lead.types.js";
import {
    calculateOpportunityScore,
    scoreContactability,
    scoreDecisionMaker,
    scoreIndustryFit,
    scoreRangeFit,
} from "./scoring.rules.js";
import { mergeDuplicates } from "../deduplication/deduplication.service.js";

const icp: ICP = {
    id: "icp-1",
    userId: "user-1",
    name: "California HVAC Growth Companies",
    industry: "HVAC",
    locations: ["CA"],
    minEmployees: 10,
    maxEmployees: 200,
    minRevenue: 1_000_000,
    maxRevenue: 50_000_000,
    businessType: "B2B",
    targetTitles: ["Owner", "CEO", "Founder"],
    keywords: ["mechanical"],
    excludedIndustries: ["Retail"],
    growthPreferences: ["hiring", "funding", "expansion"],
};

const lead: Lead = {
    id: "lead-1",
    userId: "user-1",
    company: "ABC HVAC",
    website: "https://abchvac.com",
    domain: "abchvac.com",
    industry: "HVAC",
    productServiceCategory: "Heating and cooling",
    businessType: "B2B",
    employees: 85,
    revenue: 12_000_000,
    yearFounded: 2008,
    bbbRating: "A+",
    street: null,
    city: "Los Angeles",
    state: "CA",
    country: "US",
    companyPhone: "+14155550100",
    companyLinkedin: "https://linkedin.com/company/abchvac",
    ownerFirstName: "John",
    ownerLastName: "Smith",
    ownerTitle: "Owner",
    ownerLinkedin: "https://linkedin.com/in/john-smith",
    ownerPhone: "+14155550101",
    ownerEmail: "john@abchvac.com",
    technologies: ["ServiceTitan"],
    funding: null,
    hiringSignals: "Hiring technicians",
    recentNews: null,
    growthSignals: ["hiring"],
};

describe("scoring rules", () => {
    it("scores exact industry matches highly", () => {
        expect(scoreIndustryFit(lead, icp)).toBe(100);
    });

    it("scores unrelated industries at zero", () => {
        expect(
            scoreIndustryFit({ ...lead, industry: "Restaurants" }, icp),
        ).toBe(0);
    });

    it("scores closely related healthcare industries positively", () => {
        const healthcareIcp: ICP = { ...icp, industry: "Healthcare" };
        expect(
            scoreIndustryFit(
                { ...lead, industry: "Family Practice Physician" },
                healthcareIcp,
            ),
        ).toBe(75);
        expect(
            scoreIndustryFit({ ...lead, industry: "Home Healthcare" }, healthcareIcp),
        ).toBe(100);
    });

    it("scores employee range fit", () => {
        expect(scoreRangeFit(85, 10, 200)).toBe(100);
        expect(scoreRangeFit(230, 10, 200)).toBe(70);
        expect(scoreRangeFit(900, 10, 200)).toBe(30);
    });

    it("scores revenue fit", () => {
        expect(scoreRangeFit(12_000_000, 1_000_000, 50_000_000)).toBe(100);
        expect(scoreRangeFit(null, 1_000_000, 50_000_000)).toBe(45);
    });

    it("scores decision maker fit", () => {
        expect(scoreDecisionMaker(lead, icp)).toBe(100);
        expect(
            scoreDecisionMaker(
                { ...lead, ownerTitle: "Operations Director" },
                icp,
            ),
        ).toBe(75);
        expect(scoreDecisionMaker({ ...lead, ownerTitle: null }, icp)).toBe(0);
    });

    it("scores contactability", () => {
        expect(scoreContactability(lead)).toBe(100);
        expect(
            scoreContactability({
                ...lead,
                ownerPhone: null,
                companyPhone: null,
            }),
        ).toBe(80);
        expect(
            scoreContactability({
                ...lead,
                ownerEmail: null,
                ownerLinkedin: null,
                companyLinkedin: null,
            }),
        ).toBe(40);
    });

    it("calculates a weighted final score", () => {
        const score = calculateOpportunityScore(lead, icp);
        expect(score.totalScore).toBeGreaterThanOrEqual(90);
        expect(score.recommendedAction).toBe("Contact decision maker");
    });

    it("handles missing data", () => {
        const score = calculateOpportunityScore(
            {
                ...lead,
                revenue: null,
                ownerEmail: null,
                ownerPhone: null,
                companyPhone: null,
                ownerLinkedin: null,
                companyLinkedin: null,
            },
            icp,
        );
        expect(score.totalScore).toBeLessThan(
            calculateOpportunityScore(lead, icp).totalScore,
        );
    });

    it("merges duplicate lead records without blindly deleting useful fields", () => {
        const result = mergeDuplicates([
            { ...lead, userId: undefined },
            {
                ...lead,
                userId: undefined,
                ownerEmail: null,
                growthSignals: ["expansion"],
                companyPhone: "+14155559999",
            },
        ]);
        expect(result.duplicates).toBe(1);
        expect(result.unique).toBe(1);
        expect(result.leads[0].growthSignals).toEqual(
            expect.arrayContaining(["hiring", "expansion"]),
        );
    });

    it("is deterministic for the same lead and ICP", () => {
        expect(calculateOpportunityScore(lead, icp)).toEqual(
            calculateOpportunityScore(lead, icp),
        );
    });
});
