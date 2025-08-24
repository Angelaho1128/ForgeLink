const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });
  try {
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = sub; // <- use this in routes
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
};
