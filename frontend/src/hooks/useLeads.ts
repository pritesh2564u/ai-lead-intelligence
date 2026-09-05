import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { Lead } from "../types";

export const useLeads = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: "",
        minScore: "",
        sort: "score",
        email: "",
        decisionMaker: "",
        growth: "",
    });
    const [loading, setLoading] = useState(false);
    const params = useMemo(() => {
        const p = new URLSearchParams({
            page: String(page),
            pageSize: "15",
            sort: filters.sort,
        });
        Object.entries(filters).forEach(
            ([key, value]) => value && key !== "sort" && p.set(key, value),
        );
        return p;
    }, [filters, page]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.leads(params);
            setLeads(result.data);
            setTotal(result.total);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return {
        leads,
        total,
        page,
        setPage,
        filters,
        setFilters,
        params,
        loading,
        refresh,
    };
};
