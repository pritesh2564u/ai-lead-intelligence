export const nullIfEmpty = (value: unknown): string | null => {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    return normalized.length ? normalized : null;
};

const PLACEHOLDER = /^(n\/?a|none|nil|n|na|-+|unknown|not ?available|tbd|n\/s)$/i;

export const nullIfPlaceholder = (value: unknown): string | null => {
    const raw = nullIfEmpty(value);
    return raw && PLACEHOLDER.test(raw) ? null : raw;
};

export const normalizeCompanyName = (value: unknown): string | null =>
    nullIfEmpty(value)
        ?.replace(/\s+/g, " ")
        .replace(/,?\s*(inc|llc|ltd|corp|corporation|co)\.?$/i, "")
        .trim() ?? null;

export const normalizeDomain = (websiteOrDomain: unknown): string | null => {
    const raw = nullIfPlaceholder(websiteOrDomain)?.toLowerCase();
    if (!raw) return null;
    const cleaned = raw
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        ?.split("?")[0];
    return cleaned || null;
};

export const normalizeEmail = (value: unknown): string | null =>
    nullIfEmpty(value)?.toLowerCase() ?? null;

export const normalizePhone = (value: unknown): string | null => {
    const raw = nullIfEmpty(value);
    if (!raw) return null;
    const digits = raw.replace(/[^\d+]/g, "");
    return digits.length >= 7 ? digits : null;
};

export const normalizeLinkedIn = (value: unknown): string | null => {
    const raw = nullIfEmpty(value);
    if (!raw) return null;
    return raw.startsWith("http") ? raw : `https://${raw.replace(/^\/+/, "")}`;
};

export const parseNumber = (value: unknown): number | null => {
    const raw = nullIfEmpty(value);
    if (!raw) return null;
    const multiplier = /b/i.test(raw)
        ? 1_000_000_000
        : /m/i.test(raw)
          ? 1_000_000
          : /k/i.test(raw)
            ? 1_000
            : 1;
    const parsed = Number(raw.replace(/[$,\s]/g, "").replace(/[a-z]/gi, ""));
    return Number.isFinite(parsed) ? Math.round(parsed * multiplier) : null;
};
