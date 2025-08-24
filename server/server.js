require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// --- Mongo connection ---
async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI missing");
    await mongoose.connect(uri, { dbName: "forgelink" });
    console.log("✅ Mongo connected");

    // routes
    app.get("/api/health", (_req, res) => res.json({ ok: true }));
    // mount your existing routes
    app.use("/api", require("./routes/targets"));

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`✅ API on http://localhost:${port}`));
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}
start();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import linkedinRoutes from "./routes/linkedin.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/linkedin", linkedinRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("MongoDB error:", err));
