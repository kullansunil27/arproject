const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ msg: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  user = new User({
    name,
    email,
    password: hashedPassword
  });

  await user.save();
  res.json({ msg: "User registered successfully" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

module.exports = router;
