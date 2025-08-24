const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: String,
    name: String,
    headline: String, // your headline / positioning
    experiences: [String], // bullets you’ll compare against targets
    interests: [String],
    tone: { type: String, default: "warm" },
  },
  { timestamps: true }
);

const TargetSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    name: String,
    headline: String, // provided by the user initially
    profileUrl: String, // best URL found by BrowserUse (company site, GitHub, etc.)
    sources: [String], // list of URLs used
    profileText: String, // flat text compiled from the web
    facts: [String], // concise bullets Gemini/heuristics extract
    confidence: { type: Number, default: 0.0 },
    lastFetchedAt: Date,
  },
  { timestamps: true }
);

const DraftSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Target",
      index: true,
    },
    action: { type: String, enum: ["email", "questions"], default: "email" },
    subject: String,
    body: String,
    questions: [String],
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", UserSchema),
  Target: mongoose.model("Target", TargetSchema),
  Draft: mongoose.model("Draft", DraftSchema),
};
