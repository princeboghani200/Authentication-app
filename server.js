require("dotenv").config();
const express = require("express");
const session = require("express-session");
const verifyToken = require("./middleware/middleware");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_KEY = process.env.REFRESH_KEY;
const ACCESS_KEY = process.env.ACCESS_KEY;
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());
app.use(helmet());

let refreshTokens = [];

const USER = {
  userId: "prince",
  password: "$2b$10$ub3ESKBwHn4yBgpHblq4s.uxRuXgL7zr8OPkEI6hrIsfTXcjbZfeS",
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per window
  message: { message: "Too many login attempts, please try again later." },
});

app.get("/public", (req, res) => {
  res.json({ message: "This is a public API. Anyone can access it." });
});

app.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  if (userId != USER.userId) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const passwordMatch = await bcrypt.compare(password, USER.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const accessToken = jwt.sign({ userId }, SECRET_KEY, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, REFRESH_KEY, { expiresIn: "7d" });

  refreshTokens.push(refreshToken);

  res.json({ message: "Login Complete", accessToken, refreshToken });
});

app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  jwt.verify(refreshToken, REFRESH_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign({ userId: decoded.userId }, SECRET_KEY, {
      expiresIn: "15m",
    });
    res.json({ accessToken: newAccessToken });
  });
});

app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== refreshToken); // revoke it
  res.json({ message: "Logged out successfully" });
});

app.get("/private", verifyToken, (req, res) => {
  res.json({ message: `Wlcome ${req.userId}, This is private !` });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
