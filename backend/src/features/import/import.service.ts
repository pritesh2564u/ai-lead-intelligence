import { parseString } from "@fast-csv/parse";
import { mergeDuplicates } from "../deduplication/deduplication.service.js";
import type { LeadInput } from "../leads/lead.types.js";
import {
    defaultUserId,
    deleteUserLeads,
    insertLeads,
} from "../leads/lead.repository.js";
import { demoLeads } from "./demo-data.js";
import {
    normalizeCompanyName,
    normalizeDomain,
    normalizeEmail,
    normalizeLinkedIn,
    normalizePhone,
    nullIfEmpty,
    nullIfPlaceholder,
    parseNumber,
} from "../../shared/utils/normalization.js";
import { AppError } from "../../shared/errors/AppError.js";

const splitList = (value: unknown): string[] =>
    nullIfEmpty(value)
        ?.split(/[;,]/)
        .map((item) => item.trim())
        .filter(Boolean) ?? [];

const splitCsvRow = (line: string): string[] => {
    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) {
            tokens.push(current);
            current = "";
        } else current += char;
    }
    tokens.push(current);
    return tokens;
};

const quoteCsvField = (field: string): string =>
    /[",\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;

const sanitizeCsvRows = (csv: string): string => {
    const lines = csv.split(/\r?\n/).filter((line) => line.trim().length);
    if (lines.length < 2) return csv;
    const headerCount = splitCsvRow(lines[0]).length;
    const sanitized = lines.map((line, index) => {
        if (index === 0) return line;
        const tokens = splitCsvRow(line);
        if (tokens.length <= headerCount) return line;
        const excess = tokens.length - headerCount;
        const merged = tokens
            .slice(0, excess + 1)
            .join(",")
            .trim();
        const rest = tokens.slice(excess + 1);
        return [merged, ...rest].map(quoteCsvField).join(",");
    });
    return sanitized.join("\n");
};

export const normalizeLead = (row: Record<string, unknown>): LeadInput => {
    const company = normalizeCompanyName(
        row.company ?? row.Company ?? row.name,
    );
    if (!company)
        throw new AppError("INVALID_LEAD", "Lead is missing company name", 422);
    const website = nullIfPlaceholder(row.website ?? row.Website);
    const address = nullIfEmpty(row.address ?? row.Address);
    const addressParts =
        address
            ?.split(",")
            .map((part) => part.trim())
            .filter((part) => part && !/^n\/?a$/i.test(part)) ?? [];
    return {
        company,
        website,
        domain: normalizeDomain(row.domain ?? row.Domain ?? website),
        industry: nullIfEmpty(row.industry ?? row.Industry),
        productServiceCategory: nullIfEmpty(
            row.productServiceCategory ??
                row.product_service_category ??
                row.category,
        ),
        businessType: nullIfEmpty(row.businessType ?? row.business_type),
        employees: parseNumber(row.employees ?? row.Employees),
        revenue: parseNumber(row.revenue ?? row.Revenue),
        yearFounded: parseNumber(row.yearFounded ?? row.year_founded),
        bbbRating: nullIfEmpty(
            row.bbbRating ?? row.bbb_rating ?? row["BBB Rating"],
        ),
        street: nullIfEmpty(row.street),
        city:
            nullIfEmpty(row.city ?? row.City) ??
            addressParts[addressParts.length - 2] ??
            null,
        state:
            nullIfEmpty(row.state ?? row.State) ??
            addressParts[addressParts.length - 1] ??
            null,
        country: nullIfEmpty(row.country ?? row.Country),
        companyPhone: normalizePhone(
            row.companyPhone ??
                row.company_phone ??
                row["Company Phone"] ??
                row.phone,
        ),
        companyLinkedin: normalizeLinkedIn(
            row.companyLinkedin ?? row.company_linkedin,
        ),
        ownerFirstName: nullIfEmpty(
            row.ownerFirstName ?? row.owner_first_name ?? row.firstName,
        ),
        ownerLastName: nullIfEmpty(
            row.ownerLastName ?? row.owner_last_name ?? row.lastName,
        ),
        ownerTitle: nullIfEmpty(row.ownerTitle ?? row.owner_title ?? row.title),
        ownerLinkedin: normalizeLinkedIn(
            row.ownerLinkedin ?? row.owner_linkedin ?? row.linkedin,
        ),
        ownerPhone: normalizePhone(
            row.ownerPhone ?? row.owner_phone ?? row.phone,
        ),
        ownerEmail: normalizeEmail(
            row.ownerEmail ?? row.owner_email ?? row.email,
        ),
        technologies: splitList(row.technologies),
        funding: nullIfEmpty(row.funding),
        hiringSignals: nullIfEmpty(row.hiringSignals ?? row.hiring_signals),
        recentNews: nullIfEmpty(row.recentNews ?? row.recent_news),
        growthSignals: splitList(row.growthSignals ?? row.growth_signals),
    };
};

export const parseCsv = (csv: string): Promise<LeadInput[]> =>
    new Promise((resolve, reject) => {
        const rows: LeadInput[] = [];
        parseString(sanitizeCsvRows(csv), {
            headers: true,
            ignoreEmpty: true,
            trim: true,
            maxRows: 5000,
            strictColumnHandling: true,
        })
            .on("error", reject)
            .on("data", (row) => rows.push(normalizeLead(row)))
            .on("end", () => resolve(rows));
    });

export const importLeads = async (
    leads: LeadInput[],
    userId = defaultUserId,
) => {
    await deleteUserLeads(userId);
    const deduped = mergeDuplicates(leads);
    const stored = await insertLeads(deduped.leads);
    return { ...deduped, leads: stored };
};

export const importDemoLeads = () => importLeads(demoLeads);
