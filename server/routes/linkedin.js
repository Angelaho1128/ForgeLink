import express from "express";
import { getLinkedInSummary } from "../services/openAI.js";

const router = express.Router();

// POST route: process LinkedIn profile URL
router.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Profile URL required" });

    const summary = await getLinkedInSummary(url);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: "Failed to process LinkedIn data" });
  }
});

export default router;
