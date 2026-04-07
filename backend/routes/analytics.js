const router = require("express").Router();
const Product = require("../models/Product");

// Most viewed products
router.get("/popular", async (req, res) => {
  const products = await Product.find().sort({ views: -1 }).limit(5);
  res.json(products);
});

// Category count
router.get("/categories", async (req, res) => {
  const stats = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  res.json(stats);
});

module.exports = router;
