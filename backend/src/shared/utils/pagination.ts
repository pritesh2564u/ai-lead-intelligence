export type Pagination = { page: number; pageSize: number; offset: number };

export const getPagination = (query: Record<string, unknown>): Pagination => {
    const page = Math.max(1, Number(query.page ?? 1));
    const pageSize = Math.min(100, Math.max(5, Number(query.pageSize ?? 20)));
    return { page, pageSize, offset: (page - 1) * pageSize };
};
