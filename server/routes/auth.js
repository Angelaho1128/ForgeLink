const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_TTL = "7d";

// POST /api/auth/signup  body: { username, password, name, headline }
router.post("/signup", async (req, res) => {
  try {
    const { username, password, name, headline } = req.body;
    if (!username || !password || !name || !headline) {
      return res
        .status(400)
        .json({ error: "username, password, name, headline are required" });
    }
    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists)
      return res.status(409).json({ error: "Username already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, passwordHash, name, headline });

    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, {
      expiresIn: TOKEN_TTL,
    });
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        headline: user.headline,
      },
    });
  } catch (e) {
    console.error("signup error", e);
    res.status(500).json({ error: "signup failed" });
  }
});

// POST /api/auth/login  body: { username, password }
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, {
      expiresIn: TOKEN_TTL,
    });
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        headline: user.headline,
      },
    });
  } catch (e) {
    console.error("login error", e);
    res.status(500).json({ error: "login failed" });
  }
});

module.exports = router;
