const express = require('express');
const app = express();
app.use(express.json());
const pg = require('pg');
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  
    if (!token) return res.status(401).json({ message: 'No token provided.' });
  
    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token.' });
      req.user = user;
      next();
    });
  }
  
// POST/api/admin/products
app.post('/api/admin/products', verifyToken, async (req, res) => {
    try {
      const{ name, price, description, category, imageUrl } = req.body;
  
      if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required.' });
      }
  
      const product = new Product({
        name,
        price,
        description,
        category,
        imageUrl
      });
  
      const savedProduct = await product.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ message: 'Server error while adding product.' });
    }
  });