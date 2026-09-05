import type { RequestHandler } from "express";
import { icpService } from "./icp.service.js";

export const create: RequestHandler = async (req, res, next) => {
    try {
        res.status(201).json({
            success: true,
            data: await icpService.create(req.body),
        });
    } catch (error) {
        next(error);
    }
};

export const list: RequestHandler = async (_req, res, next) => {
    try {
        res.json({ success: true, data: await icpService.list() });
    } catch (error) {
        next(error);
    }
};

export const get: RequestHandler = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: await icpService.get(String(req.params.id)),
        });
    } catch (error) {
        next(error);
    }
};

export const update: RequestHandler = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: await icpService.update(String(req.params.id), req.body),
        });
    } catch (error) {
        next(error);
    }
};

export const demo: RequestHandler = async (_req, res, next) => {
    try {
        res.status(201).json({
            success: true,
            data: await icpService.createDemo(),
        });
    } catch (error) {
        next(error);
    }
};
