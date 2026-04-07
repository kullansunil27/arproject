const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { getConnectionStatus } = require("../config/db");

// Sample products for offline mode
const sampleProducts = [
  { name: "Modern Sofa", category: "Furniture", price: 12000, description: "Comfortable 3-seater sofa", arModel: "models/furniture/sofa.glb" },
  { name: "Wooden Bed", category: "Furniture", price: 4500, description: "Queen size wooden bed", arModel: "models/furniture/bed.glb" },
  { name: "Dining Table", category: "Furniture", price: 15000, description: "6-seater dining table", arModel: "models/furniture/table.glb" },
  { name: "Garden Table", category: "Furniture", price: 8000, description: "Outdoor garden table", arModel: "models/furniture/gardentable.glb" },
  { name: "Dining Set", category: "Furniture", price: 25000, description: "Complete dining set", arModel: "models/furniture/diningset.glb" },

  { name: "Carpet", category: "Home Decor", price: 5500, description: "Modern carpet", arModel: "models/homedecor/carpet.glb" },


  { name: "Table Lamp", category: "Home Decor", price: 3000, description: "LED table lamp", arModel: "models/homedecor/lamp.glb" },
  { name: "Light Desk", category: "Home Decor", price: 7000, description: "Study desk with light", arModel: "models/homedecor/lightdesk.glb" },
  { name: "Wall Lamp", category: "Home Decor", price: 2800, description: "Wall mounted lamp", arModel: "models/homedecor/walllamp.glb" },


  { name: "Radio", category: "Electronics", price: 3500, description: "Digital radio", arModel: "models/electronics/radio.glb" },
  { name: "Speaker", category: "Electronics", price: 5000, description: "Bluetooth speaker", arModel: "models/electronics/speaker.glb" },
  { name: "Computer", category: "Electronics", price: 45000, description: "Desktop computer", arModel: "models/electronics/computer.glb" },
  { name: "Laptop", category: "Electronics", price: 65000, description: "High-performance laptop", arModel: "models/electronics/laptop.glb" },
  { name: "Thermometer", category: "Electronics", price: 2500, description: "Digital thermometer", arModel: "models/electronics/thermometer.glb" }
];

// Add IDs for offline mode
const offlineProducts = sampleProducts.map((p, index) => ({
  ...p,
  _id: `offline-${index + 1}`
}));

// ✅ Seed initial products
router.post("/seed", async (req, res) => {
  try {
    if (!getConnectionStatus()) {
      return res.status(200).json({
        message: "Offline mode - using sample products",
        count: offlineProducts.length,
        products: offlineProducts,
        offline: true
      });
    }

    // MongoDB connected - use database
    await Product.deleteMany({});
    const products = await Product.insertMany(sampleProducts);
    
    res.status(201).json({
      message: "Products seeded successfully",
      count: products.length,
      products
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Add product (Admin)
router.post("/", async (req, res) => {
  try {
    if (!getConnectionStatus()) {
      return res.status(503).json({ 
        message: "Cannot add products in offline mode",
        offline: true 
      });
    }
    const product = await Product.create(req.body);
    res.status(201).json({
      message: "Product added successfully",
      product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Get all products (User)
router.get("/", async (req, res) => {
  try {
    if (!getConnectionStatus()) {
      return res.json(offlineProducts);
    }
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    // Fallback to offline products on error
    res.json(offlineProducts);
  }
});

// ✅ Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    if (!getConnectionStatus()) {
      const product = offlineProducts.find(p => p._id === req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.json(product);
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    // Try offline products on error
    const product = offlineProducts.find(p => p._id === req.params.id);
    if (product) {
      return res.json(product);
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

