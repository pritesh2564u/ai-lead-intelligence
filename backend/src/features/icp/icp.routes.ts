import { Router } from "express";
import { validateBody } from "../../shared/middleware/validation.middleware.js";
import * as controller from "./icp.controller.js";
import { icpSchema } from "./icp.validation.js";

export const icpRoutes = Router();

icpRoutes.post("/", validateBody(icpSchema), controller.create);
icpRoutes.post("/demo", controller.demo);
icpRoutes.get("/", controller.list);
icpRoutes.get("/:id", controller.get);
icpRoutes.put("/:id", validateBody(icpSchema), controller.update);
