import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

export const errorMiddleware: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next,
) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: { code: error.code, message: error.message },
        });
        return;
    }
    console.error(error);
    res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
    });
};
