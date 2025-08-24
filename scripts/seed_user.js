require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../server/models/User");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "forgelink" });
  const u = await User.create({
    email: "dev@example.com",
    name: "Linus Torvalds",
    headline: "Software Engineer",
    experiences: ["Linux", "Git"],
    interests: ["Linux", "AI"],
  });
  console.log("Seeded user _id:", u._id.toString());
  process.exit(0);
})();
