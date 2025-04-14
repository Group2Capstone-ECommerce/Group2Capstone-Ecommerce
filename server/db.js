require("dotenv").config();

const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost:5432/group2capstone_db");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT = process.env.JWT || "shhh";

const connectDB = async () => {
  try {
    console.log("Connecting to database...");
    await client.connect();
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
    const enableUuidExtension = /*sql*/`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
    await client.query(enableUuidExtension);

  
    //Create products
    const createProductsTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_name VARCHAR(100) NOT NULL,
        descriptions TEXT,
        price NUMERIC(10, 2) NOT NULL,
        tags TEXT[],
        image_urls TEXT[],
        rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5) DEFAULT 5,
        stock_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await client.query(createProductsTable);

    //Create users
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
    await client.query(createUsersTable);

    //Create general categories
      const createCategoriesTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `;
    await client.query(createCategoriesTable);

    //Create product categories
    const createProductCategoriesTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        CONSTRAINT unique_product_categories UNIQUE (product_id, category_id)
      );
    `;
    await client.query(createProductCategoriesTable);

    //Create cart 
    const createCartsTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await client.query(createCartsTable);

    //Join table
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
    await client.query(createCartItemsTable);
      
    //Orders table
    const createOrdersTable =/*sql*/ `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'Created',
        total_price NUMERIC(10, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await client.query(createOrdersTable);

    //Order items table
    const createOrderItemsTable =/*sql*/ `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_at_purchase NUMERIC(10, 2) NOT NULL
      );
    `;
    await client.query(createOrderItemsTable);
    
    //Billing table
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
    await client.query(createBillingInfoTable);

    //Wishlist table -- optional
    const createWishlistsTable = /*sql*/`
      CREATE TABLE IF NOT EXISTS wishlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100),
        is_shared BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await client.query(createWishlistsTable);

    //Wishlist items -- optional
    const createWishlistItemsTable =/*sql*/ `
      CREATE TABLE IF NOT EXISTS wishlist_items (
        wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
      );
    `;
    await client.query(createWishlistItemsTable);

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
  const response = await client.query(SQL, [
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
  const response = await client.query(SQL, [username]);

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

//admin - get all users 
const getAllUsers = async({token}) => {
  const user = await getAuthenticatedUser({token})
  const SQL = /*sql*/`
    SELECT * FROM users
  `
  const response = await client.query(SQL)
  if(!user.is_admin){
    console.error('User is not administor! No access!')
    const error = Error('User is not administor! No access!')
    error.status = 401
    throw error
  } else {
    return response.rows
  }

}

//get user by id
const getUserById = async({userId}) => {
  const SQL = /*sql*/`
    SELECT id, username, email, is_admin, mailing_address, phone 
    FROM users 
    WHERE id = $1
  `
  const response = await client.query(SQL, [userId])
  return response.rows[0]
}

//get authenticated user
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

//get admin status
const getAdmin = async({token}) => {
  const user = await getAuthenticatedUser({token})
  return user.is_admin
}


//get all products
const getAllProducts = async() => {
  const SQL = /*sql*/`
    SELECT * FROM products
  `
  const response = await client.query(SQL)
  return response.rows
}

//get product by product_id
const getProductById = async({product_id}) => {
  const SQL = /*sql*/`
    SELECT * FROM products WHERE id = $1
  `
  const response = await client.query(SQL, [product_id])
  return response.rows[0]
}


const editProduct = async({token, product_id, product_name, descriptions, price, tags, image_urls, rating, stock_quantity}) => {
  const SQL = /*sql*/`
    UPDATE products 
    SET  product_name = $2, descriptions = $3, price = $4, tags = $5, image_urls = $6, rating = $7, stock_quantity = $8, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `
  const product = await getProductById({product_id})
  values = [
    product_id, 
    product_name || product.product_name, 
    descriptions || product.descriptions, 
    price || product.price, 
    tags || product.tags, 
    image_urls ||  product.image_urls, 
    rating || product.rating, 
    stock_quantity || product.stock_quantity
  ]
  const isAdmin = await getAdmin({token})
  if(!isAdmin){
    console.error('User is not administor! No access!')
    const error = Error('User is not administor! No access!')
    error.status = 401
    throw error
  } 
  const response = await client.query(SQL, values)
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
    return await client.query(SQL, [product_id])
  }
}

module.exports = {
  client,
  connectDB,
  createTables,
  createUser,
  authenticateUser,
  getAuthenticatedUser,
  getUserById,
  getAllUsers,
  getAllProducts,
  editProduct,
  deleteProduct
}
