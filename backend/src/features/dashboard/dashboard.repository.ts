import { query } from "../../shared/database/connection.js";
import { defaultUserId } from "../leads/lead.repository.js";

export const getStats = async () => {
    const result = await query<{
        total_leads: string;
        high_priority: string;
        average_score: string | null;
        contactable_leads: string;
        average_data_quality: string | null;
        decision_makers: string;
        with_email: string;
        with_phone: string;
        growth_companies: string;
    }>(`
    select
      count(l.id) total_leads,
      count(*) filter (where s.total_score >= 80) high_priority,
      round(avg(s.total_score)) average_score,
      count(*) filter (where l.owner_email is not null or l.owner_phone is not null or l.company_phone is not null) contactable_leads,
      round(avg(s.data_quality)) average_data_quality,
      count(*) filter (where l.owner_title is not null) decision_makers,
      count(*) filter (where l.owner_email is not null) with_email,
      count(*) filter (where l.owner_phone is not null or l.company_phone is not null) with_phone,
      count(*) filter (where cardinality(l.growth_signals) > 0) growth_companies
    from leads l
    left join lateral (select s.* from lead_scores s where s.lead_id = l.id order by s.updated_at desc limit 1) s on true
    where l.user_id = $1
  `, [defaultUserId]);
    const row = result.rows[0];
    return {
        totalLeads: Number(row.total_leads),
        highPriority: Number(row.high_priority),
        averageScore: Number(row.average_score ?? 0),
        contactableLeads: Number(row.contactable_leads),
        averageDataQuality: Number(row.average_data_quality ?? 0),
        decisionMakers: Number(row.decision_makers),
        withEmail: Number(row.with_email),
        withPhone: Number(row.with_phone),
        growthCompanies: Number(row.growth_companies),
    };
};
