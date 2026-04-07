const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/analytics", require("./routes/analytics"));

// Serve product page
app.get("/product", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/product.html"));
});

// Serve AR page
app.get("/ar", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/ar.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
