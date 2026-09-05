import { z } from "zod";

export const icpSchema = z.object({
    userId: z.string().uuid().optional(),
    name: z.string().min(2),
    industry: z.string().min(1),
    locations: z.array(z.string()).default([]),
    minEmployees: z.number().int().nonnegative().nullable().default(null),
    maxEmployees: z.number().int().nonnegative().nullable().default(null),
    minRevenue: z.number().nonnegative().nullable().default(null),
    maxRevenue: z.number().nonnegative().nullable().default(null),
    businessType: z.string().nullable().default(null),
    targetTitles: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    excludedIndustries: z.array(z.string()).default([]),
    growthPreferences: z.array(z.string()).default([]),
});
