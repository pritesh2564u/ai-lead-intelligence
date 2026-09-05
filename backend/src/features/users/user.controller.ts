import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { createUser, getUser } from "./user.repository.js";

export const create: RequestHandler = async (req, res, next) => {
    try {
        res.status(201).json({
            success: true,
            data: await createUser(req.body.email, req.body.name),
        });
    } catch (error) {
        next(error);
    }
};

export const get: RequestHandler = async (req, res, next) => {
    try {
        const user = await getUser(String(req.params.id));
        if (!user) throw new AppError("NOT_FOUND", "User not found", 404);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
