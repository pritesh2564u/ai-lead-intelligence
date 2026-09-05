import type { LeadInput } from "../leads/lead.types.js";

const keysFor = (lead: LeadInput) =>
    [
        lead.domain,
        lead.ownerEmail,
        lead.ownerLinkedin,
        lead.company
            .toLowerCase()
            .replace(/\b(inc|llc|ltd|corp|corporation|co)\b/g, "")
            .replace(/[^a-z0-9]/g, ""),
    ]
        .filter(Boolean)
        .map((key) => String(key));

export type DeduplicationResult = {
    leads: LeadInput[];
    imported: number;
    duplicates: number;
    unique: number;
};

export const mergeDuplicates = (leads: LeadInput[]): DeduplicationResult => {
    const merged = new Map<string, LeadInput>();
    const index = new Map<string, string>();
    let duplicates = 0;
    for (const lead of leads) {
        const keys = keysFor(lead);
        const key = keys.find((candidate) => index.has(candidate))
            ? index.get(keys.find((candidate) => index.has(candidate))!)!
            : keys[0];
        const existing = merged.get(key);
        if (!existing) {
            merged.set(key, lead);
            keys.forEach((candidate) => index.set(candidate, key));
            continue;
        }
        duplicates += 1;
        merged.set(key, {
            ...existing,
            ...Object.fromEntries(
                Object.entries(lead).filter(
                    ([, value]) =>
                        value !== null &&
                        value !== undefined &&
                        !(Array.isArray(value) && value.length === 0),
                ),
            ),
            technologies: Array.from(
                new Set([
                    ...(existing.technologies ?? []),
                    ...(lead.technologies ?? []),
                ]),
            ),
            growthSignals: Array.from(
                new Set([
                    ...(existing.growthSignals ?? []),
                    ...(lead.growthSignals ?? []),
                ]),
            ),
        } as LeadInput);
        keys.forEach((candidate) => index.set(candidate, key));
    }
    const uniqueLeads = Array.from(merged.values());
    return {
        leads: uniqueLeads,
        imported: leads.length,
        duplicates,
        unique: uniqueLeads.length,
    };
};
