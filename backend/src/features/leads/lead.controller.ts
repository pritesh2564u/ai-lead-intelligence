import type { RequestHandler } from "express";
import multer from "multer";
import { getPagination } from "../../shared/utils/pagination.js";
import {
    parseCsv,
    importLeads,
    importDemoLeads,
} from "../import/import.service.js";
import { analyzeLeads } from "../scoring/scoring.service.js";
import { explainLead } from "../ai/ai.service.js";
import { getLead, listLeads } from "./lead.repository.js";
import { AppError } from "../../shared/errors/AppError.js";
import { format } from "@fast-csv/format";

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2_000_000 },
});

export const importCsv: RequestHandler = async (req, res, next) => {
    try {
        if (!req.file)
            throw new AppError("VALIDATION_ERROR", "CSV file is required", 422);
        const parsed = await parseCsv(req.file.buffer.toString("utf8"));
        res.status(201).json({
            success: true,
            data: await importLeads(parsed),
        });
    } catch (error) {
        next(error);
    }
};

export const demo: RequestHandler = async (_req, res, next) => {
    try {
        res.status(201).json({ success: true, data: await importDemoLeads() });
    } catch (error) {
        next(error);
    }
};

export const list: RequestHandler = async (req, res, next) => {
    try {
        const pagination = getPagination(req.query);
        const result = await listLeads(
            req.query as Record<string, string | undefined>,
            pagination.offset,
            pagination.pageSize,
        );
        res.json({
            success: true,
            data: {
                ...result,
                page: pagination.page,
                pageSize: pagination.pageSize,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const get: RequestHandler = async (req, res, next) => {
    try {
        const lead = await getLead(String(req.params.id));
        if (!lead) throw new AppError("NOT_FOUND", "Lead not found", 404);
        res.json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

export const analyze: RequestHandler = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: await analyzeLeads(String(req.body.icpId)),
        });
    } catch (error) {
        next(error);
    }
};

export const explanation: RequestHandler = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: await explainLead(
                String(req.params.id),
                String(req.body.icpId),
            ),
        });
    } catch (error) {
        next(error);
    }
};

export const exportCsv: RequestHandler = async (req, res, next) => {
    try {
        const result = await listLeads(
            req.query as Record<string, string | undefined>,
            0,
            5000,
        );
        res.header("Content-Type", "text/csv");
        res.header(
            "Content-Disposition",
            "attachment; filename=ranked-leads.csv",
        );
        const stream = format({ headers: true });
        stream.pipe(res);
        result.data.forEach((lead, index) =>
            stream.write({
                Rank: index + 1,
                Company: lead.company,
                Website: lead.website,
                Industry: lead.industry,
                Location: [lead.city, lead.state].filter(Boolean).join(", "),
                Employees: lead.employees,
                Revenue: lead.revenue,
                "Decision Maker": [
                    lead.ownerFirstName,
                    lead.ownerLastName,
                    lead.ownerTitle,
                ]
                    .filter(Boolean)
                    .join(" "),
                Email: lead.ownerEmail,
                Phone: lead.ownerPhone || lead.companyPhone,
                LinkedIn: lead.ownerLinkedin,
                "Opportunity Score": lead.score?.totalScore,
                "Data Quality": lead.score?.dataQuality,
                "Recommended Action": lead.score?.recommendedAction,
                "AI Reason": lead.score?.aiExplanation,
            }),
        );
        stream.end();
    } catch (error) {
        next(error);
    }
};
