
const pg = require('pg');
const jwt = require('jsonwebtoken');
const express = require('express')
const router = express.Router()
const {
    pool,
    createUser, 
    createProduct,
    authenticateUser,
    getAuthenticatedUser,
    getUserById,
    getAllUsers,
    getAllProducts,
    getAvailableProducts,
    editProduct,
    deleteProduct,
    createCart,
    checkActiveCartUnique,
    getCart,
    deleteProductFromCart,
    updateCartItemQuantity,
    createOrder,
    getProductById,
    getCartItems,
    updateProductQuantity
} = require("./db");

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  
    if (!token) return res.status(401).json({ message: 'No token provided.' });
  
    jwt.verify(token, process.env.JWT || 'shhh', (err, user) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return res.status(403).json({ message: 'Invalid token.' });
      }
      req.user = user;
      next();
    });
  }

 

// GET /api/admin/users
router.get('/admin/users', verifyToken, async (req, res, next) => {
  try {
    // Grab the token from the headers
    const token = req.headers.authorization;
    // Grab the userId so we can check the user's table to see if the user is an admin or not
    const userId = req.user.id;
    console.log(`user id => `, userId);
    const user = await getUserById(userId);
    console.log(`user => `, user.is_admin);
    
    if (user.is_admin !== true) {
      return res.sendStatus(403).json({ message: 'Forbidden: Admins only.'});
    }

    const users = await getAllUsers(token);
    res.status(200).send(users)
} catch (error) {
    next(error)
}
});

// POST/api/admin/products
router.post('/admin/products', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const userId = req.user.id;

   // if (!userId) {
      //return res.status(401).json({ message: 'Unauthorized: Invalid token.'});
    //}

    console.log(`user id => `, userId);
    const user = await getUserById(userId);
    console.log(`user => `, user.is_admin);

    if (!user.is_admin) {
      return res.status(403).json({ message: 'Forbidden: Admins only.'});
    }
    
    const{ product_name, price, descriptions, stock_quantity } = req.body;
  
    if (!product_name || !price) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }


    const product = await createProduct({
      product_name,
      price,
      descriptions,
      stock_quantity
    });
  

    res.status(201).json({ message: "PRODUCT CREATED", product });
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

// POST /api/order
router.post('/order', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // now coming from verifyToken middleware
    console.log('USER ID:', userId);

    // 1. Get the user's active cart
    const cart = await checkActiveCartUnique(userId);
    console.log("CART:", cart);
    console.log("CART.ID:", cart.id);
    if (!cart) {
      return res.status(400).json({ error: "No active cart found." });
    }

    // 2. Get items in the cart
    const cartItems = await getCartItems(cart.id);
    console.log('CART ITEMS:', cartItems);
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    // 3. Check product stock and update quantities
    for (const item of cartItems) {
      console.log(`item => `, item);
      const product = await getProductById(item.product_id);
      console.log(`product => `, product);
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.product_id} not found.` });
      }
    
      console.log(`Checking stock for ${product.product_name}: ${product.stock_quantity} left`);
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}.` });
      }
    
      await updateProductQuantity(item.product_id, product.stock_quantity - item.quantity);
    }

    // 3.5 Calculate the total price
    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // 3.75 Check if order already exists for this cart id
    const existingOrder = await pool.query(
      'SELECT * FROM orders WHERE cart_id = $1',
      [cart.id]
    );
    if (existingOrder.rows.length > 0) {
      throw new Error(`Order already exists for cart_id: ${cart.id}`);
    }
  
    // 4. Create the order
    const order = await createOrder(
      userId,
      cart.id,
      'Created',
      totalPrice,
      new Date(),
      new Date()
    );

    console.log(`cart.id => `, cart.id);
    // 5. Mark the cart as inactive
    console.log("Updating cart to inactive for cart_id:", cart.id);
    await pool.query('UPDATE carts SET is_active = false WHERE id = $1', [cart.id]);

    // 6. Create a new active cart for the user
    //await createCart(userId, true);

    // 7. Return confirmation
    res.status(201).json({
      message: "Order placed successfully!",
      orderNumber: order.order_id,
    });

  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Something went wrong while placing your order." });
  }
});

//GET /api/products
router.get('/products', async(req, res, next) => {
    try {
        const response = await getAvailableProducts();
        res.status(200).send(response)
    } catch (error) {
        next(error)
    }
})

//GET /api/admin/products
router.get('/admin/products', async(req, res, next) => {
  try {
    const token = req.headers.authorization
    const response = await getAllProducts({token})
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
        stock_quantity: req.body.stock_quantity,
        is_available: req.body.is_available
    })
    res.status(200).send(response)
  } catch (error) {
      next(error)
  }
});

// DELETE /api/admin/products/:productId route
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

//POST /api/cart
router.post('/carts',verifyToken,  async(req, res, next) => {
  try {
    const user_id = req.user.id;
    const isUniqueActiveCart = await checkActiveCartUnique(user_id)
    if(!isUniqueActiveCart){
      const is_active = req.body.is_active ?? true;
      const newCart = await createCart(user_id, is_active);
      res.status(201).json(newCart);
    } else {
      console.log(isUniqueActiveCart)
      res.status(400).json({
        error: "User already has an active cart.",
        cart: isUniqueActiveCart
      });
    }
  } catch (error) {
    next(error)
  }
})

// GET /api/cart
router.get('/cart', verifyToken, async(req, res, next) => {
  try {
    const user = req.user;
    const cart = await getCart(user.id);
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in /api/cart:", error);
    next(error);
  }
});

// DELETE /api/cart/:productId
router.delete('/cart/:productId', verifyToken, async(req, res, next) => {
  try {
    const user = req.user;
    const productId = req.params.productId;

    const deletedProduct = await deleteProductFromCart(user.id, productId);

    res.status(204).json({ message: "Product deleted from cart."});
  } catch (error) {
    console.error("Error in /api/cart/:productId", error);
    next(error);
  }
});

// PUT /api/cart/:productId
router.put('/cart/:productId', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      const error = Error('Quantity must be a non-negative number.');
      error.status = 400;
      throw error;
    }

    const result = await updateCartItemQuantity(userId, productId, quantity);

    if (quantity === 0) {
      return res.status(200).json({ message: result.message });
    }

    res.status(200).json({ updatedItem: result });
  } catch (error) {
    console.error('Error updating cart item:', error);
    next(error);
  }
});

module.exports = router
