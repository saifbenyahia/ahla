import { Router } from "express";

import authenticate from "../middleware/auth.js";
import { uploadSupportAttachment } from "../middleware/upload.js";
import {
  addSupportTicketMessage,
  closeSupportTicket,
  createSupportTicket,
  getMySupportTicket,
  getMySupportTickets,
} from "../controllers/supportController.js";

const router = Router();

router.use(authenticate);

router.post("/tickets", uploadSupportAttachment.single("attachment"), createSupportTicket);
router.get("/tickets", getMySupportTickets);
router.get("/tickets/:id", getMySupportTicket);
router.post("/tickets/:id/messages", uploadSupportAttachment.single("attachment"), addSupportTicketMessage);
router.patch("/tickets/:id/close", closeSupportTicket);

export default router;
