import { randomUUID } from "node:crypto";
import { query } from "../../shared/database/connection.js";
import { defaultUserId } from "../leads/lead.repository.js";
import type { ICP, ICPInput } from "./icp.types.js";

const rowToIcp = (row: Record<string, unknown>): ICP => ({
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    industry: String(row.industry),
    locations: (row.locations as string[] | null) ?? [],
    minEmployees: row.min_employees as number | null,
    maxEmployees: row.max_employees as number | null,
    minRevenue: row.min_revenue as number | null,
    maxRevenue: row.max_revenue as number | null,
    businessType: row.business_type as string | null,
    targetTitles: (row.target_titles as string[] | null) ?? [],
    keywords: (row.keywords as string[] | null) ?? [],
    excludedIndustries: (row.excluded_industries as string[] | null) ?? [],
    growthPreferences: (row.growth_preferences as string[] | null) ?? [],
});

export const createICP = async (input: ICPInput): Promise<ICP> => {
    const id = randomUUID();
    const result = await query<Record<string, unknown>>(
        `insert into icps (id,user_id,name,industry,locations,min_employees,max_employees,min_revenue,max_revenue,business_type,target_titles,keywords,excluded_industries,growth_preferences)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning *`,
        [
            id,
            input.userId ?? defaultUserId,
            input.name,
            input.industry,
            input.locations,
            input.minEmployees,
            input.maxEmployees,
            input.minRevenue,
            input.maxRevenue,
            input.businessType,
            input.targetTitles,
            input.keywords,
            input.excludedIndustries,
            input.growthPreferences,
        ],
    );
    return rowToIcp(result.rows[0]);
};

export const listICPs = async (): Promise<ICP[]> => {
    const result = await query<Record<string, unknown>>(
        "select * from icps order by created_at desc",
    );
    return result.rows.map(rowToIcp);
};

export const getICP = async (id: string): Promise<ICP | null> => {
    const result = await query<Record<string, unknown>>(
        "select * from icps where id=$1",
        [id],
    );
    return result.rows[0] ? rowToIcp(result.rows[0]) : null;
};

export const updateICP = async (id: string, input: ICPInput): Promise<ICP> => {
    const result = await query<Record<string, unknown>>(
        `update icps set name=$2,industry=$3,locations=$4,min_employees=$5,max_employees=$6,min_revenue=$7,max_revenue=$8,business_type=$9,target_titles=$10,keywords=$11,excluded_industries=$12,growth_preferences=$13,updated_at=now()
     where id=$1 returning *`,
        [
            id,
            input.name,
            input.industry,
            input.locations,
            input.minEmployees,
            input.maxEmployees,
            input.minRevenue,
            input.maxRevenue,
            input.businessType,
            input.targetTitles,
            input.keywords,
            input.excludedIndustries,
            input.growthPreferences,
        ],
    );
    return rowToIcp(result.rows[0]);
};
