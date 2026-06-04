import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validate.js";
import { healthAssistantChat } from "./controller.js";

export const healthAssistantRouter = Router();

healthAssistantRouter.post(
  "/chat",
  requireAuth,
  body("content").isString().trim().notEmpty().withMessage("Message content is required"),
  body("language").optional().isIn(["en", "am"]),
  body("conversationId").optional().isString(),
  validateRequest,
  healthAssistantChat,
);
