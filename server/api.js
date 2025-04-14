const express = require("express");
const router = express.Router();
const client = require("./db.js").client;

router.get("/products", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM products;");
    res.json(result.rows); // This should return products as a JSON array
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
