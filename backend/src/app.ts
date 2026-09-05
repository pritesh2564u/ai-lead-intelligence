import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorMiddleware } from "./shared/middleware/error.middleware.js";
import { userRoutes } from "./features/users/user.routes.js";
import { icpRoutes } from "./features/icp/icp.routes.js";
import { leadRoutes } from "./features/leads/lead.routes.js";
import { dashboardRoutes } from "./features/dashboard/dashboard.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json({ limit: "1mb" }));
app.use(
    "/api/leads/:id/explanation",
    rateLimit({ windowMs: 60_000, limit: 20 }),
);

app.get("/api/health", (_req, res) =>
    res.json({ success: true, data: { status: "ok" } }),
);
app.use("/api/users", userRoutes);
app.use("/api/icp", icpRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(errorMiddleware);
