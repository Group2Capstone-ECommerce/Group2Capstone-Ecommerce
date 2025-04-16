
const pg = require('pg');
const jwt = require('jsonwebtoken');
const express = require('express')
const router = express.Router()
const {
    createUser, 
    createProduct,
    authenticateUser,
    getAuthenticatedUser,
    getUserById,
    getAllUsers,
    getAllProducts,
    editProduct,
    deleteProduct
} = require("./db");

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  
    if (!token) return res.status(401).json({ message: 'No token provided.' });
  
    jwt.verify(token, process.env.JWT || 'shhh', (err, user) => {
        console.log(err, user)
      if (err) return res.status(403).json({ message: 'Invalid token.' });
      req.user = user;
      next();
    });
  }

function requireAdmin(req, res, next) {
  if (!req.user || req.user.admin !== true) {
    return res.sendStatus(403).json({ message: 'Forbidden: Admins only.'});
  }
  next();
}  
// GET /api/admin/users

router.get('/admin/users', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.status(200).send(users)
} catch (error) {
    next(error)
}
});

// POST/api/admin/products
router.post('/admin/products', verifyToken, requireAdmin, async (req, res) => {
    try {
      const{ product_name, price, descriptions, stock_quantity } = req.body;
  
      if (!product_name || !price) {
        return res.status(400).json({ message: 'Name and price are required.' });
      }


      const product = createProduct({
        product_name,
        price,
        descriptions,
        stock_quantity
      });
  

     res.json("PRODUCT CREATED").sendStatus(201)
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

//GET /api/products
router.get('/products', async(req, res, next) => {
    try {
        const response = await getAllProducts();
        res.status(200).send(response)
    } catch (error) {
        next(error)
    }
})

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
