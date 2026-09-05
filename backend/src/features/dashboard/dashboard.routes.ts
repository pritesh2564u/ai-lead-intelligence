import { Router } from "express";
import { stats } from "./dashboard.controller.js";

export const dashboardRoutes = Router();
dashboardRoutes.get("/stats", stats);
