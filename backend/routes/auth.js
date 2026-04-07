const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getSupabase } = require("../config/db");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const supabase = getSupabase();

    if (!supabase) {
      return res.status(503).json({ msg: "Database not available" });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ name, email, password: hashedPassword }])
      .select()
      .single();

    if (error) {
      console.error("Registration error:", error);
      return res.status(400).json({ msg: "Registration failed" });
    }

    res.json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const supabase = getSupabase();

    if (!supabase) {
      return res.status(503).json({ msg: "Database not available" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "default-secret-key", {
      expiresIn: "1d"
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
