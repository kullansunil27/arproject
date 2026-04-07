const express = require("express");
const router = express.Router();
const { getConnectionStatus, getSupabase } = require("../config/db");

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

    const supabase = getSupabase();

    await supabase.from("products").delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const productsToInsert = sampleProducts.map(p => ({
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description || '',
      image: p.image || '',
      ar_model: p.arModel || '',
      views: 0
    }));

    const { data: products, error } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select();

    if (error) {
      console.error("Seed error:", error);
      return res.status(400).json({ message: error.message });
    }

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

    const supabase = getSupabase();
    const { name, category, price, description, image, model, arModel } = req.body;

    const { data: product, error } = await supabase
      .from("products")
      .insert([{
        name,
        category,
        price,
        description: description || '',
        image: image || '',
        ar_model: arModel || model || '',
        views: 0
      }])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return res.status(400).json({ message: error.message });
    }

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

    const supabase = getSupabase();
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return res.json(offlineProducts);
    }

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      model: p.ar_model,
      arModel: p.ar_model,
      views: p.views
    }));

    res.json(formattedProducts);
  } catch (error) {
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

    const supabase = getSupabase();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error || !product) {
      const offlineProduct = offlineProducts.find(p => p._id === req.params.id);
      if (offlineProduct) {
        return res.json(offlineProduct);
      }
      return res.status(404).json({ message: "Product not found" });
    }

    const formattedProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
      model: product.ar_model,
      arModel: product.ar_model,
      views: product.views
    };

    res.json(formattedProduct);
  } catch (error) {
    const product = offlineProducts.find(p => p._id === req.params.id);
    if (product) {
      return res.json(product);
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

