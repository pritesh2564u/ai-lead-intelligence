import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../errors/AppError.js";

export const validateBody =
    (schema: ZodSchema): RequestHandler =>
    (req, _res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            next(
                new AppError(
                    "VALIDATION_ERROR",
                    parsed.error.issues[0]?.message ?? "Invalid request",
                    422,
                ),
            );
            return;
        }
        req.body = parsed.data;
        next();
    };
