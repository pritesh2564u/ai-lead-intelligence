import type { ICP } from "../../icp/icp.types.js";
import type { RankedLead } from "../../leads/lead.types.js";

export type LeadExplanation = {
    why: string;
    positiveSignals: string[];
    concerns: string[];
    recommendedChannel: string;
    outreachAngle: string;
};

export type AIProvider = {
    explainLead(input: {
        lead: RankedLead;
        icp: ICP;
    }): Promise<LeadExplanation>;
};
