const express = require("express");
const session = require("express-session");
const app = express();

app.use(express.json());

app.use(
  session({
    secret: "AuthenticationApp",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }, //change after done
  }),
);

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
    req.session.userId = userId;
    res.json({ message: "Login successful!" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/private", (req, res) => {
  if (req.session.userId) {
    res.json({ message: `Wlcome ${req.session.userId}, This is private !` });
  } else {
    res.status(401).json({ message: "Please login first." });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
