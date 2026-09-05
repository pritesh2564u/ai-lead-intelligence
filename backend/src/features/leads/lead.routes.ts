import { Router } from "express";
import * as controller from "./lead.controller.js";

export const leadRoutes = Router();

leadRoutes.post(
    "/import",
    controller.upload.single("file"),
    controller.importCsv,
);
leadRoutes.post("/demo", controller.demo);
leadRoutes.post("/analyze", controller.analyze);
leadRoutes.post("/bulk-score", controller.analyze);
leadRoutes.get("/export", controller.exportCsv);
leadRoutes.get("/", controller.list);
leadRoutes.get("/:id", controller.get);
leadRoutes.post("/:id/explanation", controller.explanation);
