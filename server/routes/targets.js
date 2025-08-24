const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const { User, Target, Draft } = require("../models/User");
const {
  extractFacts,
  relate,
  generateAction,
  classifyAction,
} = require("../services/ai");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth); // All routes below require a valid JWT

// ---- helpers ----
function runBrowserUse(name, headline) {
  return new Promise((resolve) => {
    const py = process.env.PYTHON_BIN || "python3";
    const script = path.join(process.cwd(), "scripts", "collect_profile.py");
    const child = spawn(py, [script, name, headline], { cwd: process.cwd() });

    let out = "",
      err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("close", () => {
      if (err) console.error("[browseruse]", err.trim());
      try {
        const json = JSON.parse(out);
        resolve({
          profileText: json.profileText || "",
          sources: json.sources || [],
          bestUrl: json.bestUrl || "",
          confidence: json.confidence ?? 0,
        });
      } catch {
        resolve({
          profileText: out,
          sources: [],
          bestUrl: "",
          confidence: 0.5,
        });
      }
    });
  });
}

// ---- list targets (sidebar) ----
router.get("/targets", async (req, res, next) => {
  try {
    const ownerUserId = req.userId;
    const targets = await Target.find({ ownerUserId })
      .sort({ updatedAt: -1 })
      .select("_id name headline");
    res.json({ targets });
  } catch (e) {
    next(e);
  }
});

// ---- read one target (chat header / facts & sources) ----
router.get("/targets/:id", async (req, res, next) => {
  try {
    const t = await Target.findById(req.params.id).select(
      "_id name headline facts sources profileUrl ownerUserId profileText"
    );
    if (!t) return res.status(404).json({ error: "Target not found" });
    if (t.ownerUserId.toString() !== req.userId)
      return res.status(403).json({ error: "Forbidden" });

    res.json({
      target: {
        _id: t._id,
        name: t.name,
        headline: t.headline,
        facts: t.facts || [],
        sources: t.sources || [],
        profileUrl: t.profileUrl || "",
        profileText: t.profileText || "",
      },
    });
  } catch (e) {
    next(e);
  }
});

// ---- create/resolve (BrowserUse -> facts) ----
router.post("/targets/resolve", async (req, res, next) => {
  try {
    const ownerUserId = req.userId;
    const { name, headline } = req.body;
    if (!name || !headline)
      return res.status(400).json({ error: "name and headline required" });

    // 1) Run BrowserUse to collect public info
    const { profileText, sources, bestUrl, confidence } = await runBrowserUse(
      name,
      headline
    );

    // 2) Create target
    let target = await Target.create({
      ownerUserId,
      name,
      headline,
      profileText,
      sources,
      profileUrl: bestUrl,
      confidence,
    });

    // 3) Extract bullet facts with Gemini
    try {
      const facts = await extractFacts(profileText);
      target.facts = facts;
      await target.save();
    } catch (e) {
      console.error("extractFacts failed", e);
    }

    res.json({ target });
  } catch (e) {
    next(e);
  }
});

// ---- generate draft (email/questions) ----
router.post("/actions/generate", async (req, res, next) => {
  try {
    const ownerUserId = req.userId; // JWT
    const {
      targetId,
      action = "auto",
      tone = "warm",
      userPrompt = "",
    } = req.body;

    const user = await User.findById(ownerUserId).lean();
    const target = await Target.findById(targetId).lean();
    if (!target) return res.status(404).json({ error: "Target not found" });
    if (target.ownerUserId.toString() !== ownerUserId)
      return res.status(403).json({ error: "Forbidden" });

    const picked =
      action && action !== "auto" ? action : await classifyAction(userPrompt);

    const { overlaps, angles } = await relate(user, target.facts || []);
    const out = await generateAction({
      action: picked,
      you: user,
      targetName: target.name,
      overlaps,
      angles,
      tone,
      userPrompt,
      facts: target.facts || [],
      sources: target.sources || [],
      profileUrl: target.profileUrl || "",
      profileText: target.profileText || "",
    });

    res.json({ draft: { action: picked, ...out } });
  } catch (e) {
    next(e);
  }
});

// ---- delete a target (trash icon) ----
router.delete("/targets/:id", async (req, res, next) => {
  try {
    const t = await Target.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Target not found" });
    if (t.ownerUserId.toString() !== req.userId)
      return res.status(403).json({ error: "Forbidden" });
    await t.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
