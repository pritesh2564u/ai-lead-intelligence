import dotenv from "dotenv";

dotenv.config();

export const env = {
    databaseUrl: process.env.DATABASE_URL ?? "",
    port: Number(process.env.PORT ?? 5000),
    frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
    aiProvider: process.env.AI_PROVIDER ?? "groq",
    aiApiKey: process.env.AI_API_KEY ?? "",
    aiModel: process.env.AI_MODEL ?? "llama-3.1-8b-instant",
    aiBaseUrl: process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1",
};
