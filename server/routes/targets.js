const express = require("express");
const { spawn } = require("child_process");
const { User, Target, Draft } = require("../models/User");
const { extractFacts, relate, generateAction } = require("../services/ai");
const router = express.Router();

router.post("/targets/resolve", async (req, res, next) => {
  try {
    const { ownerUserId, name, headline } = req.body;
    if (!ownerUserId || !name || !headline) {
      return res
        .status(400)
        .json({ error: "ownerUserId, name, headline required" });
    }

    const {
      profileText,
      sources = [],
      bestUrl = "",
      confidence = 0.5,
    } = await runBrowserUse(name, headline);

    const target = await Target.create({
      ownerUserId,
      name,
      headline,
      profileUrl: bestUrl,
      sources,
      profileText,
      confidence,
      lastFetchedAt: new Date(),
    });

    target.facts = await extractFacts(profileText);
    await target.save();

    res.json({ target });
  } catch (e) {
    next(e);
  }
});

router.post("/actions/generate", async (req, res, next) => {
  try {
    const {
      ownerUserId,
      targetId,
      action = "email",
      tone = "warm",
      userPrompt = "",
    } = req.body;
    const user = await User.findById(ownerUserId);
    const target = await Target.findById(targetId);
    if (!user || !target)
      return res.status(404).json({ error: "User or Target not found" });

    const { overlaps, angles } = await relate(user, target.facts || []);
    const out = await generateAction({
      action,
      you: user,
      targetName: target.name,
      overlaps,
      angles,
      tone,
      userPrompt,
    });

    const draft = await Draft.create({
      ownerUserId,
      targetId,
      action,
      subject: out.subject || "",
      body: out.body || "",
      questions: out.questions || [],
    });

    res.json({ draft });
  } catch (e) {
    next(e);
  }
});

// List previous connections for a user
router.get("/targets", async (req, res, next) => {
  try {
    const { ownerUserId } = req.query;
    if (!ownerUserId)
      return res.status(400).json({ error: "ownerUserId required" });
    const targets = await Target.find({ ownerUserId })
      .sort({ updatedAt: -1 })
      .select("_id name headline");
    res.json({ targets });
  } catch (e) {
    next(e);
  }
});

// Get one target (to show name/sources in Chat)
router.get("/targets/:id", async (req, res, next) => {
  try {
    const target = await Target.findById(req.params.id).select(
      "_id name headline sources profileUrl facts"
    );
    if (!target) return res.status(404).json({ error: "Target not found" });
    res.json({ target });
  } catch (e) {
    next(e);
  }
});

function runBrowserUse(name, headline) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "python3",
      ["scripts/collect_profile.py", name, headline],
      { cwd: process.cwd() }
    );
    let buf = "";
    proc.stdout.on("data", (d) => (buf += d.toString()));
    proc.stderr.on("data", (d) => console.error("[browseruse]", d.toString()));
    proc.on("close", (code) => {
      if (code !== 0) return reject(new Error("browseruse failed"));
      try {
        resolve(JSON.parse(buf));
      } catch {
        resolve({ profileText: buf });
      }
    });
  });
}

module.exports = router;
