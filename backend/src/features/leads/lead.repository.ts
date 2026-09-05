import { randomUUID } from "node:crypto";
import { query } from "../../shared/database/connection.js";
import type { ICP } from "../icp/icp.types.js";
import type { Lead, LeadInput, LeadScore, RankedLead } from "./lead.types.js";

export const defaultUserId = "00000000-0000-0000-0000-000000000001";

export const deleteUserLeads = async (userId: string) => {
    await query("delete from leads where user_id = $1", [userId]);
};

const rowToLead = (row: Record<string, unknown>): Lead => ({
    id: String(row.id),
    userId: String(row.user_id),
    company: String(row.company),
    website: row.website as string | null,
    domain: row.domain as string | null,
    industry: row.industry as string | null,
    productServiceCategory: row.product_service_category as string | null,
    businessType: row.business_type as string | null,
    employees: row.employees as number | null,
    revenue: row.revenue as number | null,
    yearFounded: row.year_founded as number | null,
    bbbRating: row.bbb_rating as string | null,
    street: row.street as string | null,
    city: row.city as string | null,
    state: row.state as string | null,
    country: row.country as string | null,
    companyPhone: row.company_phone as string | null,
    companyLinkedin: row.company_linkedin as string | null,
    ownerFirstName: row.owner_first_name as string | null,
    ownerLastName: row.owner_last_name as string | null,
    ownerTitle: row.owner_title as string | null,
    ownerLinkedin: row.owner_linkedin as string | null,
    ownerPhone: row.owner_phone as string | null,
    ownerEmail: row.owner_email as string | null,
    technologies: (row.technologies as string[] | null) ?? [],
    funding: row.funding as string | null,
    hiringSignals: row.hiring_signals as string | null,
    recentNews: row.recent_news as string | null,
    growthSignals: (row.growth_signals as string[] | null) ?? [],
});

const rowToScore = (row: Record<string, unknown> | null): LeadScore | null => {
    if (!row?.lead_id) return null;
    return {
        leadId: String(row.lead_id),
        icpId: String(row.icp_id),
        totalScore: Number(row.total_score),
        industryFit: Number(row.industry_fit),
        companySizeFit: Number(row.company_size_fit),
        revenuePotential: Number(row.revenue_potential),
        growthSignals: Number(row.growth_signals_score),
        contactability: Number(row.contactability),
        decisionMakerFit: Number(row.decision_maker_fit),
        dataQuality: Number(row.data_quality),
        recommendedAction: String(row.recommended_action),
        aiExplanation: row.ai_explanation as string | null,
        aiGeneratedAt: row.ai_generated_at as string | null,
        reasons: (row.reasons as string[] | null) ?? [],
        concerns: (row.concerns as string[] | null) ?? [],
    };
};

export const insertLeads = async (leads: LeadInput[]): Promise<Lead[]> => {
    const inserted: Lead[] = [];
    for (const lead of leads) {
        const id = randomUUID();
        const result = await query<Record<string, unknown>>(
            `insert into leads (id,user_id,company,website,domain,industry,product_service_category,business_type,employees,revenue,year_founded,bbb_rating,street,city,state,country,company_phone,company_linkedin,owner_first_name,owner_last_name,owner_title,owner_linkedin,owner_phone,owner_email,technologies,funding,hiring_signals,recent_news,growth_signals)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29) returning *`,
            [
                id,
                lead.userId ?? defaultUserId,
                lead.company,
                lead.website,
                lead.domain,
                lead.industry,
                lead.productServiceCategory,
                lead.businessType,
                lead.employees,
                lead.revenue,
                lead.yearFounded,
                lead.bbbRating,
                lead.street,
                lead.city,
                lead.state,
                lead.country,
                lead.companyPhone,
                lead.companyLinkedin,
                lead.ownerFirstName,
                lead.ownerLastName,
                lead.ownerTitle,
                lead.ownerLinkedin,
                lead.ownerPhone,
                lead.ownerEmail,
                lead.technologies,
                lead.funding,
                lead.hiringSignals,
                lead.recentNews,
                lead.growthSignals,
            ],
        );
        inserted.push(rowToLead(result.rows[0]));
    }
    return inserted;
};

export const getLead = async (id: string): Promise<RankedLead | null> => {
    const result = await query<Record<string, unknown>>(
        `select l.*, s.*, s.growth_signals as growth_signals_score, l.growth_signals as growth_signals
     from leads l left join lead_scores s on s.lead_id = l.id
     where l.id = $1 order by s.updated_at desc limit 1`,
        [id],
    );
    if (!result.rows[0]) return null;
    return { ...rowToLead(result.rows[0]), score: rowToScore(result.rows[0]) };
};

export const listLeads = async (
    filters: Record<string, string | undefined>,
    offset: number,
    limit: number,
): Promise<{ data: RankedLead[]; total: number }> => {
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (sql: string, value: unknown) => {
        params.push(value);
        where.push(sql.replace("?", `$${params.length}`));
    };
    if (filters.search) {
        params.push(`%${filters.search}%`);
        where.push(
            `(l.company ilike $${params.length} or l.domain ilike $${params.length})`,
        );
    }
    if (filters.industry) add("l.industry = ?", filters.industry);
    if (filters.state) add("l.state = ?", filters.state);
    if (filters.minScore)
        add("coalesce(s.total_score,0) >= ?", Number(filters.minScore));
    if (filters.email === "true") where.push("l.owner_email is not null");
    if (filters.phone === "true")
        where.push(
            "(l.owner_phone is not null or l.company_phone is not null)",
        );
    if (filters.decisionMaker === "true")
        where.push("l.owner_title is not null");
    if (filters.growth === "true")
        where.push("cardinality(l.growth_signals) > 0");
    const whereSql = where.length ? `where ${where.join(" and ")}` : "";
    const latestScore = `left join lateral (select s.* from lead_scores s where s.lead_id = l.id order by s.updated_at desc limit 1) s on true`;
    const sortMap: Record<string, string> = {
        score: "s.total_score desc nulls last",
        scoreAsc: "s.total_score asc nulls last",
        revenue: "l.revenue desc nulls last",
        employees: "l.employees desc nulls last",
        dataQuality: "s.data_quality desc nulls last",
        contactability: "s.contactability desc nulls last",
    };
    const sort = sortMap[filters.sort ?? "score"] ?? sortMap.score;
    const total = await query<{ count: string }>(
        `select count(distinct l.id) from leads l ${latestScore} ${whereSql}`,
        params,
    );
    const data = await query<Record<string, unknown>>(
        `select l.*, s.*, s.growth_signals as growth_signals_score, l.growth_signals as growth_signals
     from leads l ${latestScore} ${whereSql}
     order by ${sort}, l.company asc offset $${params.length + 1} limit $${params.length + 2}`,
        [...params, offset, limit],
    );
    return {
        total: Number(total.rows[0]?.count ?? 0),
        data: data.rows.map((row) => ({
            ...rowToLead(row),
            score: rowToScore(row),
        })),
    };
};

export const upsertScores = async (scores: LeadScore[]) => {
    for (const score of scores) {
        await query(
            `insert into lead_scores (lead_id,icp_id,total_score,industry_fit,company_size_fit,revenue_potential,growth_signals,contactability,decision_maker_fit,data_quality,recommended_action,reasons,concerns)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       on conflict (lead_id, icp_id) do update set total_score=excluded.total_score, industry_fit=excluded.industry_fit, company_size_fit=excluded.company_size_fit, revenue_potential=excluded.revenue_potential, growth_signals=excluded.growth_signals, contactability=excluded.contactability, decision_maker_fit=excluded.decision_maker_fit, data_quality=excluded.data_quality, recommended_action=excluded.recommended_action, reasons=excluded.reasons, concerns=excluded.concerns, updated_at=now()`,
            [
                score.leadId,
                score.icpId,
                score.totalScore,
                score.industryFit,
                score.companySizeFit,
                score.revenuePotential,
                score.growthSignals,
                score.contactability,
                score.decisionMakerFit,
                score.dataQuality,
                score.recommendedAction,
                score.reasons,
                score.concerns,
            ],
        );
    }
};

export const allLeads = async (): Promise<Lead[]> => {
    const result = await query<Record<string, unknown>>("select * from leads");
    return result.rows.map(rowToLead);
};

export const updateAiExplanation = async (
    leadId: string,
    icpId: string,
    explanation: string,
) =>
    query(
        "update lead_scores set ai_explanation=$1, ai_generated_at=now() where lead_id=$2 and icp_id=$3",
        [explanation, leadId, icpId],
    );
