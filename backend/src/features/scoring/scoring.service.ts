import { AppError } from "../../shared/errors/AppError.js";
import { getICP } from "../icp/icp.repository.js";
import { allLeads, upsertScores } from "../leads/lead.repository.js";
import { calculateOpportunityScore } from "./scoring.rules.js";

export const analyzeLeads = async (icpId: string) => {
    const icp = await getICP(icpId);
    if (!icp) throw new AppError("NOT_FOUND", "ICP not found", 404);
    const leads = await allLeads();
    const scores = leads.map((lead) => calculateOpportunityScore(lead, icp));
    await upsertScores(scores);
    return {
        analyzed: scores.length,
        highPriority: scores.filter((score) => score.totalScore >= 80).length,
    };
};
