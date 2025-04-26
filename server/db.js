require("dotenv").config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT = process.env.JWT || "shhh";

const connectDB = async () => {
  try {
    console.log("Connecting to database...");
    await pool.connect();
    console.log("Connected to database.");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    console.log("Creating tables...");

    // UUID generation function
    const enableUuidExtension = `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
    await pool.query(enableUuidExtension);


    // //Drop tables if exist
    // console.log('Running dropTablesIfExist query...')
    // const dropTablesIfExist = `
    //   DROP TABLE IF EXISTS products CASCADE;
    //   DROP TABLE IF EXISTS users CASCADE;
    //   DROP TABLE IF EXISTS categories CASCADE;
    //   DROP TABLE IF EXISTS product_categories CASCADE;
    //   DROP TABLE IF EXISTS carts CASCADE;
    //   DROP TABLE IF EXISTS cart_items CASCADE;
    //   DROP TABLE IF EXISTS orders CASCADE;
    //   DROP TABLE IF EXISTS order_items CASCADE;
    //   DROP TABLE IF EXISTS billing_info CASCADE;
    //   DROP TABLE IF EXISTS wishlists CASCADE;
    //   DROP TABLE IF EXISTS wishlist_items CASCADE;
    // `;
    // await pool.query(dropTablesIfExist);
    // console.log('Finished running dropTablesIfExist query...')

   
    console.log('Creating products table...');
    
    //Create products
    const createProductsTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_name VARCHAR(100) NOT NULL,
        descriptions TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock_quantity INTEGER CHECK (stock_quantity >= 0) DEFAULT 0,
        image_url TEXT DEFAULT NULL,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(createProductsTable);
    console.log('Products table created or already exists.');

    //Create users
    console.log('Creating users table...');
    const createUsersTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        mailing_address TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(createUsersTable);

    // Create categories table
    console.log('Creating categories table...');
    const createCategoriesTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `;
    await pool.query(createCategoriesTable);

    // Create product_categories table
    console.log('Creating product_categories table...');
    const createProductCategoriesTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        CONSTRAINT unique_product_categories UNIQUE (product_id, category_id)
      );
    `;
    await pool.query(createProductCategoriesTable);

    // Create carts table
    console.log('Creating carts table...');
    const createCartsTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(createCartsTable);

    // Create cart_items table
    console.log('Creating cart_items table...');
    const createCartItemsTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price_at_addition NUMERIC (10, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(createCartItemsTable);

    // Create orders table
    console.log('Creating orders table...');
    const createOrdersTable =/*sql*/ `
      CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      cart_id UUID REFERENCES carts(id) ON DELETE SET NULL,  -- cart_id field exists
      status VARCHAR(20) DEFAULT 'Created',
      total_price NUMERIC(10, 2),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `;
    await pool.query(createOrdersTable);

    // Create order_items table
    console.log('Creating order_items table...');
    const createOrderItemsTable =/*sql*/ `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price_at_purchase NUMERIC(10, 2) NOT NULL
      );
    `;
    await pool.query(createOrderItemsTable);

    // Create billing_info table
    console.log('Creating billing_info table...');
    const createBillingInfoTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS billing_info (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address_line1 TEXT NOT NULL,
        address_line2 TEXT,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) NOT NULL,
        company_name VARCHAR(100),
        tax_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(createBillingInfoTable);

    // Create wishlists table
    console.log('Creating wishlists table...');
    const createWishlistsTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS wishlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100),
        is_shared BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(createWishlistsTable);

    // Create wishlist_items table
    console.log('Creating wishlist_items table...');
    const createWishlistItemsTable =/*sql*/ `
      CREATE TABLE IF NOT EXISTS wishlist_items (
        wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
      );
    `;
    await pool.query(createWishlistItemsTable);

    console.log("All tables created.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};
 

 // Verifies and decodes a JWT
const verifyJWT = (token) => {
  return jwt.verify(token, JWT);
};

// Create User - register
const createUser = async ({ email, username, password_hash, is_admin = false, mailing_address, phone }) => {
  const SQL = /*sql*/ `
    INSERT INTO users (id, email, username, password_hash, is_admin, mailing_address, phone)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const response = await pool.query(SQL, [
    uuid.v4(),
    email,
    username,
    await bcrypt.hash(password_hash, 5),
    is_admin,
    mailing_address,
    phone
  ]);

  const user = response.rows[0];

  const token = jwt.sign({ id: user.id}, JWT , {
    algorithm: "HS256",
  });
  return {user, token};
};


// Authentication
const authenticateUser = async ({ username, password }) => {
  console.log("Authenticating user:", username);

  const SQL = /*sql*/ `
    SELECT id, password_hash, is_admin 
    FROM users 
    WHERE username = $1;
  `;
  const response = await pool.query(SQL, [username]);

  if (!response.rows.length) {
    console.error("Invalid username or password");
    return null;
  }

  const storedPasswordHash = response.rows[0].password_hash;

  console.log('Password entered:', password);
  console.log('Stored hash:', storedPasswordHash);

  // Compare provided password with the stored hash
  const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);

  if (!isPasswordValid) {
    console.error("Invalid username or password");
    return null;
  }

  // Grab is_admin so we can use it later
  const user = response.rows[0];
  const isAdmin = user.is_admin;

  const token = jwt.sign({ id: user.id }, JWT, {
    algorithm: "HS256",
  });

  console.log("Generated Token:", token);

  return { isAdmin, token };
};

// Product
const createProduct = async({ product_name, descriptions, price, stock_quantity, image_url}) => {
  const SQL = /*sql*/ `
      INSERT INTO products(
          id, 
          product_name, 
          descriptions, 
          price,
          stock_quantity,
          image_url
      ) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;
  `;
  const response = await pool.query(SQL, [uuid.v4(), product_name, descriptions, price, stock_quantity, image_url]);
  return response.rows[0];
};


// Categories
const createCategories = async (categoryNames) => {
  if (!Array.isArray(categoryNames)) {
    throw new TypeError("Expected an array of category names.");
  }

  const createdCategories = [];

  for (const name of categoryNames) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM categories WHERE name = $1',
        [name]
      );

      if (rows.length > 0) {
        console.log(`Category "${name}" already exists.`);
        createdCategories.push(rows[0]);
        continue;
      }

      const insert = await pool.query(
        'INSERT INTO categories(name) VALUES($1) RETURNING *',
        [name]
      );

      createdCategories.push(insert.rows[0]);
    } catch (err) {
      console.error(`Error inserting category "${name}":`, err);
    }
  }
  return createdCategories;
};

// Product Categories
const createProductCategory = async ({ product_id, category_id }) => {
  if (!product_id || !category_id) {
    console.warn("Both product_id and category_id are required.", {
      product_id,
      category_id,
    });
    return null;
  }

  const SQL = `
    INSERT INTO product_categories(
      product_id, 
      category_id
    ) VALUES($1, $2) RETURNING *;
  `;
  const response = await pool.query(SQL, [product_id, category_id]);
  return response.rows[0];
};

// Create cart
const createCart = async (user_id, is_active) => {
  const created_at = new Date();
  const updated_at = new Date();

  const SQL = /*sql*/ `
    INSERT INTO carts(
      id, 
      user_id, 
      is_active, 
      created_at, 
      updated_at
    ) VALUES($1, $2, $3, $4, $5) RETURNING *;
  `;

  const response = await pool.query(SQL, [
    uuid.v4(),
    user_id,
    is_active,
    created_at,
    updated_at,
  ]);
  return response.rows[0];
};

//Check if the user already has an active cart
const checkActiveCartUnique = async (user_id) => {
  try {
    const SQL = /*sql*/`
      SELECT * FROM carts WHERE user_id = $1 AND is_active = 't' LIMIT 1;
    `;
    const response = await pool.query(SQL, [user_id]);
    if (response.rows.length > 0) {
      console.log('response.rows.length => ', response.rows.length);
      console.log('response.rows[0] => ', response.rows[0]);
      return response.rows[0];  // Active cart exists
    } else {
      return false;  // No active cart
    }
  } catch (error) {
    throw new Error('Error checking active cart: ' + error.message);
  }
};

// Get cart
const getCart = async (userId) => {
  try {
    const query = `
      SELECT 
        products.id AS product_id,
        products.product_name,
        products.price,
        cart_items.quantity
      FROM carts
      JOIN cart_items ON carts.id = cart_items.cart_id
      JOIN products ON cart_items.product_id = products.id
      WHERE carts.user_id = $1
    `;

    const { rows } = await pool.query(query, [userId]);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  } catch (error) {
    console.error("Error in getCart:", error);
    throw error;
  }
};

// Check if product exists before inserting
const checkProductExists = async (product_id) => {
  const result = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
  return result.rows.length > 0;
};

// CartItems
const createCartItem = async (cart_id, product_id, quantity, created_at, updated_at) => {
  const productResult = await pool.query(`SELECT price FROM products WHERE id = $1`, [product_id]);
  if (productResult.rows.length === 0) {
    throw new Error("Product does not exist.");
  }

  price_at_addition = productResult.rows[0].price;

  const SQL = /*sql*/ `
    INSERT INTO cart_items(
      id, 
      cart_id, 
      product_id, 
      quantity, 
      price_at_addition,
      created_at, 
      updated_at
    ) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;
  `;
  
  const response = await pool.query(SQL, [uuid.v4(), cart_id, product_id, quantity, price_at_addition, created_at, updated_at]);
  return response.rows[0];
};

// Orders
const createOrder = async (user_id, cart_id, status, total_price, created_at, updated_at) => {
  const SQL = /*sql*/ `
    INSERT INTO orders(
      id, 
      user_id, 
      cart_id, 
      status, 
      total_price, 
      created_at, 
      updated_at
    ) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;
  `;
  const response = await pool.query(SQL, [uuid.v4(), user_id, cart_id, status, total_price, created_at, updated_at]);
  return response.rows[0];
};

// OrderItems
const createOrderItem = async ({ order_id, product_id, quantity, price_at_purchase }) => {
  const SQL = `
    INSERT INTO order_items(
      id, 
      order_id, 
      product_id, 
      quantity, 
      price_at_purchase
    ) VALUES($1, $2, $3, $4, $5) RETURNING *;
  `;
  const response = await pool.query(SQL, [uuid.v4(), order_id, product_id, quantity, price_at_purchase]);
  return response.rows[0];
};

// Billing Info
const createBillingInfo = async ({
  user_id, order_id, full_name, email, phone,
  address_line1, address_line2, city, state,
  postal_code, country, company_name, tax_id,
  created_at = new Date(), updated_at = new Date()
}) => {
  const SQL = `
    INSERT INTO billing_info(
      id, user_id, order_id, full_name, email, phone,
      address_line1, address_line2, city, state,
      postal_code, country, company_name, tax_id,
      created_at, updated_at
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
             $11, $12, $13, $14, $15, $16) RETURNING *;
  `;
  const response = await pool.query(SQL, [
    uuid.v4(), user_id, order_id, full_name, email, phone,
    address_line1, address_line2, city, state,
    postal_code, country, company_name, tax_id,
    created_at, updated_at
  ]);
  return response.rows[0];
};

// Wishlists
const createWishlist = async ({ user_id, name, is_shared = false }) => {
  const SQL = `
    INSERT INTO wishlists (
      id,
      user_id,
      name,
      is_shared
    ) VALUES($1, $2, $3, $4) RETURNING *;
  `;
  const response = await pool.query(SQL, [uuid.v4(), user_id, name, is_shared]);
  return response.rows[0];
};

// Wishlist Items
const createWishlistItem = async (wishlist_id, product_id) => {
  const SQL = /*sql*/ `
    INSERT INTO wishlist_items(
        wishlist_id,
        product_id
    ) VALUES($1, $2) RETURNING *;
  `;
  const response = await pool.query(SQL, [wishlist_id, product_id]);
  return response.rows[0];
}

// Admin - Get all users 
const getAllUsers = async(token) => {
  console.log(`token => `, token);
  const SQL = /*sql*/`
    SELECT * FROM users;
  `;
  const response = await pool.query(SQL);
    return response.rows;
}

// Get user by id
const getUserById = async(userId) => {
  const SQL = /*sql*/`
    SELECT id, username, email, is_admin, mailing_address, phone 
    FROM users 
    WHERE id = $1
  `
  const response = await pool.query(SQL, [userId])
  return response.rows[0]
}


// Get all products for admin
const getAllProducts = async() => {
  const SQL = /*sql*/`
    SELECT * FROM products
  `
  const response = await pool.query(SQL)
  return response.rows
}

//get all available products for all users
const getAvailableProducts = async() => {
  const SQL = /*sql*/ `
    SELECT * FROM products WHERE is_available = TRUE
  `
  const response = await pool.query(SQL)
  return response.rows
}

// Get product by product_id
const getProductById = async(product_id) => {
  try {
    console.log('product_id => ', product_id);
    const SQL = /*sql*/`
      SELECT * FROM products WHERE id = $1;
    `;
    const response = await pool.query(SQL, [product_id]);

    if (response.rows.length > 0) {
      return response.rows[0]; // Return the product object
    } else {
      return null; // If product is not found, return null
    }
  } catch (error) {
    console.error('Error retrieving product by ID:', error);
    throw new Error('Error retrieving product: ' + error.message);
  }
}


const editProduct = async({product_id, product_name, descriptions, price, stock_quantity, image_url, is_available}) => {
  const SQL = /*sql*/`
    UPDATE products 
    SET  
      product_name = $2, 
      descriptions = $3, 
      price = $4, 
      stock_quantity = $5, 
      image_url = $6, 
      is_available = $7, 
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `
  const product = await getProductById(product_id)
  values = [
    product_id, 
    product_name ?? product.product_name, 
    descriptions ?? product.descriptions, 
    price ?? product.price,
    stock_quantity ?? product.stock_quantity,
    image_url ?? product.image_url,
    is_available ?? product.is_available
  ]
  const response = await pool.query(SQL, values)
  return response.rows[0]
};

const deleteProduct = async({product_id}) => {
  const SQL = /*sql*/`
    DELETE FROM products WHERE id = $1
  `
  return await pool.query(SQL, [product_id])

}

// Delete product from user's cart
const deleteProductFromCart = async(userId, productId) => {
  // First verify that a cart exists for the user
  const getCartForUser = await getCart(userId);
  if (!getCartForUser) {
    const error = Error('No cart returned for user.');
    error.status = 404;
    throw error;
  }

  // SQL to delete from the cart_items
  const SQL = /*sql*/
    `DELETE FROM cart_items
    USING carts
    WHERE cart_items.cart_id = carts.id
      AND carts.user_id = $1
      AND cart_items.product_id = $2
    RETURNING cart_items.*;`;

    const result = await pool.query(SQL, [userId, productId]);

    // Throw error if user tries to delete a product not in the cart
    if (result.rowCount === 0) {
      const error = Error('Product not found in user\'s cart.');
      error.status = 404;
      throw error;
    }
    
    return result.rows[0];
};

// Update cart item quantity
const updateCartItemQuantity = async (userId, productId, quantity) => {
  // First check if cart exists for the given user
  const cart = await getCart(userId);
  if (!cart) {
    const error = Error('No cart found for user.');
    error.status = 404;
    throw error;
  }

  // If quantity is 0, then delete the item from the cartx
  if (quantity === 0) {
    const SQL = `
      DELETE FROM cart_items
      USING carts
      WHERE cart_items.cart_id = carts.id
        AND carts.user_id = $1
        AND cart_items.product_id = $2
      RETURNING cart_items.*;`;

    const result = await pool.query(SQL, [userId, productId]);
    if (result.rowCount === 0) {
      const error = Error('Product not found in user\'s cart.');
      error.status = 404;
      throw error;
    }
    return { message: 'Product removed from cart.' };
  }

  // Otherwise, update the quantity
  const SQL = `
    UPDATE cart_items
    SET quantity = $3, updated_at = NOW()
    FROM carts
    WHERE cart_items.cart_id = carts.id
      AND carts.user_id = $1
      AND cart_items.product_id = $2
    RETURNING cart_items.*;`;

  const result = await pool.query(SQL, [userId, productId, quantity]);
  if (result.rowCount === 0) {
    const error = Error('Product not found in user\'s cart.');
    error.status = 404;
    throw error;
  }

  return result.rows[0];
};

// Get cart items
const getCartItems = async (cart_id) => {
  try {
    const SQL = /*sql*/`
      SELECT * FROM cart_items WHERE cart_id = $1;
    `;
    const response = await pool.query(SQL, [cart_id]);
    console.log('items in cart => ', response.rows);
    return response.rows;  // Return the cart items
  } catch (error) {
    console.error("Error retrieving cart items:", error);
    throw new Error("Error retrieving cart items: " + error.message);
  }
};

// Update the product quantity
const updateProductQuantity = async (productId, newQuantity) => {
  try {
    // Check if the product exists before updating
    const checkProductSQL = /*sql*/`
      SELECT * FROM products WHERE id = $1;
    `;
    const checkResponse = await pool.query(checkProductSQL, [productId]);
    
    if (checkResponse.rows.length === 0) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    // Update the product quantity
    const SQL = /*sql*/`
      UPDATE products 
      SET stock_quantity = $1 
      WHERE id = $2
      RETURNING *;
    `;
    const response = await pool.query(SQL, [newQuantity, productId]);

    if (response.rows.length === 0) {
      throw new Error(`Failed to update stock quantity for product with ID ${productId}.`);
    }

    return response.rows[0]; // Return the updated product
  } catch (error) {
    console.error("Error updating product stock quantity:", error);
    throw new Error('Error updating product stock quantity: ' + error.message);
  }
};

// Get user by username
async function getUserByUsername(username) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error in getUserByUsername:', err);
    throw err;
  }
}

// Get user by email
async function getUserByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error in getUserByEmail:', err);
    throw err;
  }
}

// Update user email
const updateUserEmail = async (userId, newEmail) => {
  const SQL = /*sql*/ `
    UPDATE users
    SET email = $1
    WHERE id = $2
    RETURNING id, email;
  `;
  try {
    const result = await pool.query(SQL, [newEmail, userId]);

    // If no rows were updated, return null
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0]; // Return updated user data
  } catch (error) {
    console.error("Error updating email:", error);
    throw new Error("Error updating email.");
  }
};

// Check if email exists
const checkEmailExists = async (email) => {
  const SQL = /*sql*/ `
    SELECT 1
    FROM users
    WHERE email = $1;
  `;

  try {
    const result = await pool.query(SQL, [email]);
    // If result.rows is not empty, the email already exists
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking if email exists:", error);
    throw new Error("Database error occurred while checking email.");
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  connectDB,
  createTables,
  authenticateUser,
  createProduct,
  createUser,
  createCategories,
  createProductCategory,
  createCart,
  createCartItem,
  createOrder,
  createOrderItem,
  createBillingInfo,
  createWishlist,
  createWishlistItem,
  getUserById,
  getAllUsers,
  getAllProducts,
  getAvailableProducts,
  getProductById,
  editProduct,
  deleteProduct,
  checkActiveCartUnique,
  getCart,
  deleteProductFromCart,
  updateCartItemQuantity,
  getCartItems,
  updateProductQuantity,
  getUserByUsername,
  getUserByEmail,
  updateUserEmail,
  checkEmailExists
}
