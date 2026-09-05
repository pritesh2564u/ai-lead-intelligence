import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";
import { getICP } from "../icp/icp.repository.js";
import { getLead, updateAiExplanation } from "../leads/lead.repository.js";
import type { LeadExplanation } from "./providers/ai.provider.js";
import { CompatibleProvider } from "./providers/compatible.provider.js";
import { GroqProvider } from "./providers/groq.provider.js";

const fallback = (
    lead: NonNullable<Awaited<ReturnType<typeof getLead>>>,
): LeadExplanation => ({
    why: `${lead.company} scored ${lead.score?.totalScore ?? 0}/100 based on deterministic fit, contactability, growth, and data quality signals. AI is unavailable, so this explanation uses only known scored fields.`,
    positiveSignals: lead.score?.reasons ?? [],
    concerns: lead.score?.concerns?.length
        ? lead.score.concerns
        : ["No additional concerns detected from available data."],
    recommendedChannel: lead.ownerEmail
        ? "Email"
        : lead.ownerPhone || lead.companyPhone
          ? "Phone"
          : lead.ownerLinkedin
            ? "LinkedIn"
            : "Research contact first",
    outreachAngle: lead.growthSignals.length
        ? `Reference known growth activity: ${lead.growthSignals.join(", ")}.`
        : "Lead with the strongest known ICP fit and ask a concise discovery question.",
});

const provider =
    env.aiProvider === "groq" ? new GroqProvider() : new CompatibleProvider();

export const explainLead = async (
    leadId: string,
    icpId: string,
): Promise<LeadExplanation & { unavailable: boolean }> => {
    const lead = await getLead(leadId);
    const icp = await getICP(icpId);
    if (!lead || !lead.score)
        throw new AppError("NOT_FOUND", "Analyzed lead not found", 404);
    if (!icp) throw new AppError("NOT_FOUND", "ICP not found", 404);
    if (lead.score.aiExplanation)
        return {
            ...(JSON.parse(lead.score.aiExplanation) as LeadExplanation),
            unavailable: false,
        };
    if (!env.aiApiKey) return { ...fallback(lead), unavailable: true };
    try {
        const explanation = await provider.explainLead({ lead, icp });
        await updateAiExplanation(leadId, icpId, JSON.stringify(explanation));
        return { ...explanation, unavailable: false };
    } catch {
        return { ...fallback(lead), unavailable: true };
    }
};
