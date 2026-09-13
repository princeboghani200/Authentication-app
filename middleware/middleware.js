require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // expect: "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // split "Bearer xyz" → take "xyz"

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.userId = decoded.userId; // attach decoded data to req for the route to use
    next(); // move on to the actual route handler
  });
}

module.exports = verifyToken;