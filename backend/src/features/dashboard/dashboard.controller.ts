import type { RequestHandler } from "express";
import { getStats } from "./dashboard.repository.js";

export const stats: RequestHandler = async (_req, res, next) => {
    try {
        res.json({ success: true, data: await getStats() });
    } catch (error) {
        next(error);
    }
};
