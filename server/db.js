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

    // // Drop tables if exist
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
    // ;`
    // await pool.query(dropTablesIfExist);

    console.log('Creating products table...');
    
    //Create products
    const createProductsTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_name VARCHAR(100) NOT NULL,
        descriptions TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
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
  return response.rows[0];
};


// Authentication
const authenticateUser = async ({ username, password }) => {
  console.log("Authenticating user: ", username);
  const SQL = /*sql*/ `
    SELECT id, password_hash 
    FROM users 
    WHERE username = $1;
  `;
  const response = await pool.query(SQL, [username]);

  if (!response.rows.length) {
    console.error("Invalid username or password");
    const error = Error("Invalid username or password");
    error.status = 401;
    throw error;
  }

  const storedPasswordHash = response.rows[0].password_hash;

  // Compare provided password with the stored hash
  const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);

  if (!response.rows.length || !isPasswordValid) {
    console.error("Invalid username or password");
    const error = Error("Invalid username or password");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ id: response.rows[0].id }, JWT , {
    algorithm: "HS256",
  });
  console.log("Generated Token:", token);
  return { token };
};

// Product
const createProduct = async({ product_name, descriptions, price, stock_quantity}) => {
  const SQL = /*sql*/ `
      INSERT INTO products(
          id, 
          product_name, 
          descriptions, 
          price,
          stock_quantity
      ) VALUES($1, $2, $3, $4, $5) RETURNING *;
  `;
  const response = await pool.query(SQL, [uuid.v4(), product_name, descriptions, price, stock_quantity]);
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

// Carts
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

// Check if product exists before inserting
const checkProductExists = async (product_id) => {
  const result = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
  return result.rows.length > 0;
};

// CartItems
const createCartItem = async (cart_id, product_id, quantity, created_at, updated_at) => {
  const productExists = await checkProductExists(product_id);
  if (!productExists) {
    throw new Error("Product does not exist.");
  }

  const SQL = /*sql*/ `
    INSERT INTO cart_items(
      id, 
      cart_id, 
      product_id, 
      quantity, 
      created_at, 
      updated_at
    ) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;
  `;
  
  const response = await pool.query(SQL, [uuid.v4(), cart_id, product_id, quantity, created_at, updated_at]);
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
const getAllUsers = async({token}) => {
  const user = await getAuthenticatedUser({token})
  const SQL = /*sql*/`
    SELECT * FROM users
  `
  const response = await pool.query(SQL)
  if(!user.is_admin){
    console.error('User is not administor! No access!')
    const error = Error('User is not administor! No access!')
    error.status = 401
    throw error
  } else {
    return response.rows
  }

}

// Get user by id
const getUserById = async({userId}) => {
  const SQL = /*sql*/`
    SELECT id, username, email, is_admin, mailing_address, phone 
    FROM users 
    WHERE id = $1
  `
  const response = await pool.query(SQL, [userId])
  return response.rows[0]
}

// Get authenticated user
const getAuthenticatedUser = async ({ token }) => {
  try {
    const payload = verifyJWT(token);
    const user = await getUserById({ userId: payload.id });

    if (!user) {
      const error = new Error("Authenticated user not found");
      error.status = 404;
      throw error;
    }

    return user;
  } catch (err) {
    console.error("Error in getAuthenticatedUser:", err.message);
    throw err;
  }
};

// Get admin status
const getAdmin = async({token}) => {
  const user = await getAuthenticatedUser({token})
  return user.is_admin
}


// Get all products
const getAllProducts = async() => {
  const SQL = /*sql*/`
    SELECT * FROM products
  `
  const response = await pool.query(SQL)
  return response.rows
}

//get product by product_id
const getProductById = async({product_id}) => {
  const SQL = /*sql*/`
    SELECT * FROM products WHERE id = $1
  `
  const response = await pool.query(SQL, [product_id])
  return response.rows[0]
}


const editProduct = async({token, product_id, product_name, descriptions, price, stock_quantity}) => {
  const SQL = /*sql*/`
    UPDATE products 
    SET  product_name = $2, descriptions = $3, price = $4, stock_quantity = $5, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `
  const product = await getProductById({product_id})
  values = [
    product_id, 
    product_name || product.product_name, 
    descriptions || product.descriptions, 
    price || product.price,
    stock_quantity || product.stock_quantity
  ]
  const isAdmin = await getAdmin({token})
  if(!isAdmin){
    console.error('User is not administor! No access!')
    const error = Error('User is not administor! No access!')
    error.status = 401
    throw error
  } 
  const response = await pool.query(SQL, values)
  return response.rows[0]

}
const deleteProduct = async({token, product_id}) => {
  const SQL = /*sql*/`
    DELETE FROM products WHERE id = $1
  `
  const isAdmin = await getAdmin({token})
  if(!isAdmin){
    console.error('User is not administor! No access!')
    const error = Error('User is not administor! No access!')
    error.status = 401
    throw error
  } else {
    return await pool.query(SQL, [product_id])
  }
}

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
  getAuthenticatedUser,
  getUserById,
  getAllUsers,
  getAllProducts,
  editProduct,
  deleteProduct
}
