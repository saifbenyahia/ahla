// ──────────────────────────────────────────────
// Saved Campaigns Routes — /api/saved/*
// ──────────────────────────────────────────────

import { Router } from "express";
import authenticate from "../middleware/auth.js";
import * as SavedModel from "../models/savedCampaignModel.js";

const router = Router();

// GET /api/saved — get all saved campaigns for the authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const campaigns = await SavedModel.getByUser(req.user.id);
    res.json({ success: true, campaigns });
  } catch (err) {
    console.error("Get saved error:", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// POST /api/saved/:campaignId — save (bookmark) a campaign
router.post("/:campaignId", authenticate, async (req, res) => {
  try {
    await SavedModel.save(req.user.id, req.params.campaignId);
    res.json({ success: true, message: "Campagne enregistrée." });
  } catch (err) {
    console.error("Save campaign error:", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// DELETE /api/saved/:campaignId — unsave (remove bookmark)
router.delete("/:campaignId", authenticate, async (req, res) => {
  try {
    const removed = await SavedModel.unsave(req.user.id, req.params.campaignId);
    res.json({ success: true, removed });
  } catch (err) {
    console.error("Unsave campaign error:", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// GET /api/saved/check/:campaignId — check if a campaign is saved
router.get("/check/:campaignId", authenticate, async (req, res) => {
  try {
    const saved = await SavedModel.isSaved(req.user.id, req.params.campaignId);
    res.json({ success: true, saved });
  } catch (err) {
    console.error("Check saved error:", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

export default router;
