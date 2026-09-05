import { AppError } from "../../shared/errors/AppError.js";
import type { ICPInput } from "./icp.types.js";
import { createICP, getICP, listICPs, updateICP } from "./icp.repository.js";

export const demoICP: ICPInput = {
    name: "California HVAC Growth Companies",
    industry: "HVAC",
    locations: ["California", "CA"],
    minEmployees: 10,
    maxEmployees: 200,
    minRevenue: 1_000_000,
    maxRevenue: 50_000_000,
    businessType: "B2B",
    targetTitles: ["Owner", "CEO", "Founder", "President"],
    keywords: ["hvac", "mechanical", "facilities"],
    excludedIndustries: ["Restaurants", "Retail"],
    growthPreferences: ["hiring", "funding", "expansion", "revenue growth"],
};

export const icpService = {
    create: createICP,
    list: listICPs,
    get: async (id: string) => {
        const icp = await getICP(id);
        if (!icp) throw new AppError("NOT_FOUND", "ICP not found", 404);
        return icp;
    },
    update: updateICP,
    createDemo: () => createICP(demoICP),
};
