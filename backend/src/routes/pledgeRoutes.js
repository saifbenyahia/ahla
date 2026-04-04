import { Router } from "express";
import authenticate from "../middleware/auth.js";
import { createPledge, getMySupportedCampaigns } from "../controllers/pledgeController.js";

const router = Router();

router.get("/my", authenticate, getMySupportedCampaigns);
router.post("/", authenticate, createPledge);

export default router;
