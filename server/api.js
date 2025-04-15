
const pg = require('pg');
const jwt = require('jsonwebtoken');
const express = require('express')
const router = express.Router()
const {
    client, 
    createUser, 
    authenticateUser,
    getAuthenticatedUser,
    getUserById,
    getAllUsers,
    getAllProducts,
    editProduct,
    deleteProduct
} = require("./db.js");

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
router.post('/api/admin/products', verifyToken, async (req, res) => {
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

// POST /api/auth/register route
router.post("/auth/register", async (req, res, next) => {
  try {
    const { email, username, password, is_admin, mailing_address, phone } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username, password are required" });
    }

    // Check if user already exists in users database
    const checkUserSQL = /*sql*/`
      SELECT * FROM users WHERE email = $1 OR username = $2;
    `;
    const checkResponse = await client.query(checkUserSQL, [email, username]);

    if (checkResponse.rows.length > 0) {
      return res.status(400).json({ error: "User with this email or username already exists." });
    }

    const newUser = await createUser({ email, username, password_hash: password, is_admin, mailing_address, phone });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
  }
});
  
// POST/api/auth/login route
router.post("/auth/login", async (req, res, next) => {
  try {
    const {username, password} = req.body;
    
    if (!username || !password) {
      res.status(400).json({error: "Username and/or password are required."});
    }

    res.send(await authenticateUser(req.body));
  } catch (ex) {
    next(ex);
  }
});

//PUT /api/admin/products/:productId route
router.put('/admin/products/:productId', async(req, res, next) => {
  try {
    const token = req.headers.authorization
    const productId = req.params.productId
    const response = await editProduct({
        token,
        product_id:productId,
        product_name: req.body.product_name,
        descriptions: req.body.descriptions,
        price: req.body.price,
        stock_quantity: req.body.stock_quantity
    })
    res.status(200).send(response)
  } catch (error) {
      next(error)
  }
});

//DELETE /api/admin/products/:productId route
router.delete('/admin/products/:productId', async(req, res, next) => {
  try {
    const token = req.headers.authorization
    const product_id = req.params.productId
    await deleteProduct({token, product_id})
    res.status(204).send()
  } catch (error) {
      next(error)
  }
});

module.exports = router
