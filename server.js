const express = require("express");
const app = express();

app.use(express.json());

const USER = {
  userId: "prince",
  password: "password123",
};

app.get("/public", (req, res) => {
  res.json({ message: "This is a public API. Anyone can access it." });
});

app.post("/login", (req, res) => {
  const { userId, password } = req.body;

  if (userId === USER.userId && password === USER.password) {
    res.json({ message: "Login successful!" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/private", (req, res) => {
  res.json({ message: "This is supposed to be a private API!" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
