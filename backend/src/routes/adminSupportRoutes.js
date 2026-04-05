import { Router } from "express";

import authenticate from "../middleware/auth.js";
import { uploadSupportAttachment } from "../middleware/upload.js";
import {
  addAdminSupportTicketMessage,
  addAdminSupportTicketNote,
  assignAdminSupportTicket,
  getAdminSupportTicket,
  getAdminSupportTickets,
  updateAdminSupportTicket,
} from "../controllers/adminSupportController.js";

const router = Router();

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Acces reserve aux administrateurs.",
    });
  }

  next();
};

router.use(authenticate, requireAdmin);

router.get("/tickets", getAdminSupportTickets);
router.get("/tickets/:id", getAdminSupportTicket);
router.post("/tickets/:id/messages", uploadSupportAttachment.single("attachment"), addAdminSupportTicketMessage);
router.post("/tickets/:id/notes", addAdminSupportTicketNote);
router.patch("/tickets/:id", updateAdminSupportTicket);
router.patch("/tickets/:id/assign", assignAdminSupportTicket);

export default router;
