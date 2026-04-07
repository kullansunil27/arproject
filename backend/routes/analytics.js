const router = require("express").Router();
const { getSupabase, getConnectionStatus } = require("../config/db");

// Most viewed products
router.get("/popular", async (req, res) => {
  try {
    if (!getConnectionStatus()) {
      return res.json([]);
    }

    const supabase = getSupabase();
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("views", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Popular products error:", error);
      return res.json([]);
    }

    res.json(products);
  } catch (error) {
    res.json([]);
  }
});

// Category count
router.get("/categories", async (req, res) => {
  try {
    if (!getConnectionStatus()) {
      return res.json([]);
    }

    const supabase = getSupabase();
    const { data: products, error } = await supabase
      .from("products")
      .select("category");

    if (error) {
      console.error("Categories error:", error);
      return res.json([]);
    }

    const stats = products.reduce((acc, p) => {
      const existing = acc.find(s => s._id === p.category);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: p.category, count: 1 });
      }
      return acc;
    }, []);

    res.json(stats);
  } catch (error) {
    res.json([]);
  }
});

module.exports = router;
