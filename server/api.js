
const pg = require('pg');
const jwt = require('jsonwebtoken');
const express = require('express')
const router = express.Router()
const {
    pool,
    createUser, 
    createProduct,
    authenticateUser,
    getUserById,
    getAllUsers,
    getAllProducts,
    getAvailableProducts,
    getProductById,
    editProduct,
    deleteProduct,
    createCart,
    checkActiveCartUnique,
    getCart,
    getCartId,
    closeCart,
    deleteProductFromCart,
    updateCartItemQuantity,
    createOrder,
    deleteOrderItems,
    createCartItem,
    getCartItems,
    updateProductQuantity, 
    createOrderItem,
    getUserByUsername,
    getUserByEmail
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
    
    const{ product_name, price, descriptions, stock_quantity, image_url } = req.body;
  
    if (!product_name || !price) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }


    const product = await createProduct({
      product_name,
      price,
      descriptions,
      stock_quantity,
      image_url
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

    // Checks for if username or email already exist in the db
    const usernameAvailability = await getUserByUsername(username)
    const emailAvailability = await getUserByEmail(email)
    if(usernameAvailability){
      return res.status(400).json({ error: "Username is taken!" });
    }   
    if(emailAvailability){
    return res.status(400).json({ error: "Email is taken!" });
    }

    const newUser = await createUser({ email, username, password_hash: password, is_admin, mailing_address, phone });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
  }
});
  
// POST /api/auth/login route
router.post("/auth/login", async (req, res, next) => {
  try {
    const {username, password} = req.body;
    
    if (!username || !password) {
      return res.status(400).json({error: "Username and/or password are required."});
    }

    const user = await authenticateUser({ username, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    res.json(user);
  } catch (ex) {
      console.error("Login error:", ex);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Create order POST /api/order/create
router.post('/order/create', verifyToken, async(req, res, next) => {
  try {
    const userId = req.user.id
    console.log('USER ID:', userId);

    //get user's active cart
    const cart = await checkActiveCartUnique(userId)
    console.log('Active cart is => ', cart)
    if(!cart) {
      return res.status(400).json({ error: "No active cart found." });
    }

    //create order

    //pass the totalPrice and selected items from the frontend fetch requst body
    let totalPrice = req.body.totalPrice
    let items = req.body.selectedProducts

    for(const item of items) {
      console.log('Items are =>', items)
      const product = await getProductById(item.product_id)
      console.log('Selected product is =>', product)
      
      //check if the product exists
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.product_id} not found.` });
      }
      
      // check if in-stock quantity is enough to check out
      console.log(`Checking stock for ${product.product_name}: ${product.stock_quantity} left`);
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}.` });
      }
    }

    //if product exists and in-stock quantity is enough then create a new order
    const newOrder = await createOrder(
      userId,
      cart.id,
      'Created',
      totalPrice,
      new Date(),
      new Date()
    );

    //crated order items
    for(const item of items) {
      console.log('Selected item each is =>', item)
      const orderItem = await createOrderItem({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price
      })
      const product = await getProductById(item.product_id)
      //update the product instock quantity after order placed
      await updateProductQuantity(item.product_id, product.stock_quantity - item.quantity);
    }

    
   

    //delete the items from the active cart after creating an order
    const productIds = items.map(i => i.product_id);
    for(const productId of productIds){
      await  deleteProductFromCart(userId, productId);
    }

    //Check if there are items left in the active cart after creating the order
    const remaining = await getCartItems(cart.id)
     //make the cart inactive if the user checked out all items in the cart
    if(remaining.length === 0) {
      await closeCart(cart.id, userId)
      //since we have create new cart handled in add to cart function, no need to double work
    }

    //Return confirmation
    res.status(200).json({
      message: "Order placed successfully!",
      order: newOrder
    })
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Something went wrong while placing your order." });
  }
})


// GET /api/products
router.get('/products', async(req, res, next) => {
    try {
        const response = await getAvailableProducts();
        res.status(200).send(response)
    } catch (error) {
        next(error)
    }
})

// GET /api/admin/products
router.get('/admin/products',verifyToken, async(req, res, next) => {
  try {
    const userId = req.user?.id
    const user = await getUserById(userId)
    console.log('user is =>', user)
    if(!user.is_admin){
      return res.status(403).json({message: 'No access! Admin only!'})
    }
    const response = await getAllProducts()
    res.status(200).send(response)
  } catch (error) {
    next(error)
  }
})


//GET /api/products/:productId
router.get('/products/:productId', async(req, res, next) => {
  try {
    const product_id = req.params.productId
    const response = await getProductById(product_id)
    res.status(200).send(response)
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/products/:productId route
router.put('/admin/products/:productId', verifyToken, async(req, res, next) => {
  console.log(req.user)
  try {
    const userId = req.user?.id
    const user = await getUserById(userId)
    console.log('user is =>', user)
    if(!user.is_admin){
      return res.status(403).json({message: 'No access! Admin only!'})
    }
    const productId = req.params.productId
    const response = await editProduct({
        product_id: productId,
        product_name: req.body.product_name,
        descriptions: req.body.descriptions,
        price: req.body.price,
        stock_quantity: req.body.stock_quantity,
        image_url: req.body.image_url,
        is_available: req.body.is_available
    })
    res.status(200).send(response)
  } catch (error) {
      next(error)
  }
});

// DELETE /api/admin/products/:productId route
router.delete('/admin/products/:productId', verifyToken, async(req, res, next) => {
  try {
    const userId = req.user?.id
    const user = await getUserById(userId)
    console.log('user is =>', user)
    if(!user.is_admin){
      return res.status(403).json({message: 'No access! Admin only!'})
    }
    const product_id = req.params.productId
    await deleteProduct({product_id})
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

//POST /api/cart/items
router.post('/cart/items', verifyToken, async(req, res, next) => {
  try {
    const user = req.user;

    console.log('user is =>', await getUserById(user.id))
    console.log('adding to user =>', user)

    let cart = await getCartId(user.id)

    //create a cart if the logged-in user does not have an active cart
    if(!cart){
      cart = await createCart(user.id, true)
    }

    console.log('Adding to cart =>', cart)
    const cartId = cart?.id

    const items = await getCartItems(cartId)

    console.log('items in cart =>', items)

    const {productId, quantity} = req.body
    
    const newCartItem = await createCartItem(cartId, productId, quantity)
    console.log('new cart items =>', newCartItem)
    console.log('new cart =>', await getCart(user.id))
    res.status(200).send({
      message: "Item added into your cart!",
      item: newCartItem,
    })
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(400).json({ error: error.message })
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
