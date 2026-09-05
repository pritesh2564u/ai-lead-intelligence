import type { ICP, Lead } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type ApiResponse<T> = {
    success: boolean;
    data: T;
    error?: { message: string };
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(`${API_URL}${path}`, options);
    const payload = (await res.json()) as ApiResponse<T>;
    if (!res.ok || !payload.success)
        throw new Error(payload.error?.message ?? "Request failed");
    return payload.data;
};

export const api = {
    stats: () => request<Record<string, number>>("/dashboard/stats"),
    listIcps: () => request<ICP[]>("/icp"),
    demoIcp: () => request<ICP>("/icp/demo", { method: "POST" }),
    createIcp: (icp: Omit<ICP, "id">) =>
        request<ICP>("/icp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(icp),
        }),
    demoLeads: () =>
        request<{ imported: number; duplicates: number; unique: number }>(
            "/leads/demo",
            { method: "POST" },
        ),
    importCsv: (file: File) => {
        const data = new FormData();
        data.append("file", file);
        return request<{
            imported: number;
            duplicates: number;
            unique: number;
        }>("/leads/import", { method: "POST", body: data });
    },
    analyze: (icpId: string) =>
        request<{ analyzed: number; highPriority: number }>("/leads/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ icpId }),
        }),
    leads: (params: URLSearchParams) =>
        request<{
            data: Lead[];
            total: number;
            page: number;
            pageSize: number;
        }>(`/leads?${params}`),
    lead: (id: string) => request<Lead>(`/leads/${id}`),
    explanation: (id: string, icpId: string) =>
        request<{
            why: string;
            positiveSignals: string[];
            concerns: string[];
            recommendedChannel: string;
            outreachAngle: string;
            unavailable: boolean;
        }>(`/leads/${id}/explanation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ icpId }),
        }),
    exportUrl: (params: URLSearchParams) => `${API_URL}/leads/export?${params}`,
};
