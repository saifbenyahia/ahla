// ──────────────────────────────────────────────
// Admin Routes — /api/admin/*
// All routes protected by JWT + admin role check
// ──────────────────────────────────────────────

import { Router } from "express";
import authenticate from "../middleware/auth.js";
import { deleteAdminComment, getAdminCampaignComments } from "../controllers/commentController.js";
import {
  getStats,
  getAllCampaigns,
  getPendingCampaigns,
  getPledges,
  getUsers,
  approveCampaign,
  rejectCampaign,
  updateAcceptedCampaign,
  updateAcceptedCampaignImage,
  updateAcceptedCampaignVideo,
  deleteCampaign,
  deleteUser,
  updateUser,
  changeUserRole,
  updateUserName,
} from "../controllers/adminController.js";
import { uploadMedia } from "../middleware/upload.js";

const router = Router();

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Accès réservé aux administrateurs.",
    });
  }
  next();
};

// All admin routes require JWT + ADMIN role
router.use(authenticate, requireAdmin);

router.get("/stats", getStats);
router.get("/campaigns", getAllCampaigns);
router.get("/campaigns/pending", getPendingCampaigns);
router.get("/campaigns/:id/comments", getAdminCampaignComments);
router.get("/pledges", getPledges);
router.get("/users", getUsers);
router.put("/campaigns/:id", updateAcceptedCampaign);
router.post("/campaigns/:id/image", uploadMedia.single("file"), updateAcceptedCampaignImage);
router.post("/campaigns/:id/video", uploadMedia.single("file"), updateAcceptedCampaignVideo);
router.delete("/campaigns/:id", deleteCampaign);
router.delete("/comments/:commentId", deleteAdminComment);
router.put("/users/:id", updateUser);
router.post("/campaigns/:id/approve", approveCampaign);
router.post("/campaigns/:id/reject", rejectCampaign);

// ── User management ────
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", changeUserRole);
router.put("/users/:id/name", updateUserName);

export default router;
