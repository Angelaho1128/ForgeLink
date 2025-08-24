require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI missing");
    await mongoose.connect(uri, { dbName: "forgelink" });
    console.log("✅ Mongo connected");

    // mount routes
    app.get("/api/health", (_req, res) => res.json({ ok: true }));
    app.use("/api", require("./routes/targets"));
    app.use("/api/auth", require("./routes/auth"));

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`✅ API on http://localhost:${port}`));
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}
start();
