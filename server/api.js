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

//get all products
router.get('/products', async(req, res, next) => {
    try {
        const response = await getAllProducts()
        res.status(200).send(response)
    } catch (error) {
        next(error)
    }
})

//PUT /api/admin/products/:productId route
// Must provide JWT token with call
// Able to edit:
// Quantity
// Product name
// Description
// Anything else?
// Returns updated product
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
            tags: req.body.tags,
            image_urls: req.body.image_urls,
            rating: req.body.rating,
            stock_quantity: req.body.stock_quantity
        })
        res.status(200).send(response)
    } catch (error) {
        next(error)
    }
})

router.delete('/admin/products/:productId', async(req, res, next) => {
    try {
        const token = req.headers.authorization
        const product_id = req.params.productId
        await deleteProduct({token, product_id})
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})


module.exports = router