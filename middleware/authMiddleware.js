const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SuperSecretKey";

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Token missing." });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid token format." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user data
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
