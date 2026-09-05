import { env } from "../../../config/env.js";
import type { AIProvider, LeadExplanation } from "./ai.provider.js";

export class CompatibleProvider implements AIProvider {
    async explainLead(
        input: Parameters<AIProvider["explainLead"]>[0],
    ): Promise<LeadExplanation> {
        if (!env.aiApiKey) throw new Error("AI API key is not configured");
        const response = await fetch(`${env.aiBaseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.aiApiKey}`,
            },
            body: JSON.stringify({
                model: env.aiModel,
                messages: [
                    {
                        role: "system",
                        content:
                            "You explain deterministic B2B lead scores. Be concise. Never invent facts. Return strict JSON with why, positiveSignals, concerns, recommendedChannel, outreachAngle.",
                    },
                    { role: "user", content: JSON.stringify(input) },
                ],
                temperature: 0.2,
                response_format: { type: "json_object" },
            }),
        });
        if (!response.ok)
            throw new Error(`AI provider failed with ${response.status}`);
        const payload = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };
        return JSON.parse(
            payload.choices?.[0]?.message?.content ?? "{}",
        ) as LeadExplanation;
    }
}
