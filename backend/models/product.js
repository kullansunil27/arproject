const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["Accessories", "Furniture", "Home Decor", "Electronics"],
    required: true
  },
  price: { type: Number, required: true },
  description: String,
  image: String,
  arModel: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
