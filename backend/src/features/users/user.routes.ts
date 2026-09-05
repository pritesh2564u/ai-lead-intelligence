import { Router } from "express";
import { validateBody } from "../../shared/middleware/validation.middleware.js";
import * as controller from "./user.controller.js";
import { userSchema } from "./user.validation.js";

export const userRoutes = Router();

userRoutes.post("/", validateBody(userSchema), controller.create);
userRoutes.get("/:id", controller.get);
