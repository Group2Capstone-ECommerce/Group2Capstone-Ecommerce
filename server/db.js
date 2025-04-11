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
    const enableUuidExtension = `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
    await client.query(enableUuidExtension);

  
    //Create products
    const createProductsTable = `
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
    const createUsersTable = `
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
      const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `;
    await client.query(createCategoriesTable);

    //Create product categories
    const createProductCategoriesTable = `
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        CONSTRAINT unique_product_categories UNIQUE (product_id, category_id)
      );
    `;
    await client.query(createProductCategoriesTable);

    //Create cart 
    const createCartsTable = `
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
    const createCartItemsTable = `
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
    const createOrdersTable = `
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
    const createOrderItemsTable = `
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
    const createBillingInfoTable = `
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
    const createWishlistsTable = `
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
    const createWishlistItemsTable = `
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

// Product -
const createProduct = async({product_name})=> {
    const SQL = /*sql*/ `
        INSERT INTO products(
            id, 
            product_name, 
            descriptions, 
            price, tags, 
            image_urls, 
            rating, 
            stock_quantity, 
            created_at, 
            updated_at
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), product_name, descriptions, price, tags, image_urls, rating, stock_quantity, created_at, updated_at])
    return response.rows[0]
}

// Users -
const createUser = async({username})=> {
    const SQL = /*sql*/ `
        INSERT INTO users(
            id, 
            username, 
            email, 
            password_hash, 
            is_admin, 
            mailing_address, 
            phone, 
            created_at, 
            updated_at
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), username, email, await bcrypt.hash(password, 5), is_admin, mailing_address, phone, created_at, updated_at])
    return response.rows[0]
}

// Categories -
const createCategories = async({name})=> {
    const SQL = /*sql*/ `
        INSERT INTO categories(
            id, 
            name
        ) VALUES($1,$2) RETURN *;
    `
    const response = await client.query(SQL, [uuid.v4(), name])
    return response.rows[0]
}

// ProductCategories -
const createProductCategory = async()=> {
    const SQL = /*sql*/ `
        INSERT INTO product_categories(
            product_id, 
            category_id
        ) VALUES($1, $2) RETURN *;
    `;
    const response = await client.query(SQL, [product_id, category_id])
    return response.rows[0]
}

// Carts -
const createCart = async()=> {
    const SQL = /*sql*/ `
        INSERT INTO carts(
            id, 
            user_id, 
            is_active, 
            created_at, 
            updated_at
        ) VALUES($1, $2, $3, $4, $5) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, is_active, created_at, updated_at])
    return response.rows[0]
}

// CartItems -
const createCartItem = async()=> {
    const SQL = /*sql*/ `
        INSERT INTO cart_items(
            id, 
            cart_id, 
            product_id, 
            quantity, 
            created_at, 
            updated_at
        ) VALUES($1, $2, $3, $4, $5, $6) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), cart_id, product_id, quantity, created_at, updated_at])
    return response.rows[0]
}

// Orders -
const createOrder = async()=> {
    const SQL = /*sql*/ `
        INSERT INTO orders(
            id, 
            user_id, 
            status, 
            total_price, 
            created_at, 
            updated_at
        ) VALUES($1, $2, $3, $4, $5, $6) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, status, total_price, created_at, updated_at])
    return response.rows[0]
}

// OrderItems -
const createOrderItem = async()=> {
    const SQL = /*sql*/ `
        INSERT INTO order_items(
            id, 
            order_id, 
            product_id, 
            quantity, 
            price_at_purchase
        ) VALUES($1, $2, $3, $4, $5) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), order_id, product_id, quantity, price_at_purchase])
    return response.rows[0]
}

// BillingInfo - 
const createBillingInfo = async()=> {
    const SQL = /*sql*/ `
        INSERT INTO billing_info(
            id, 
            user_id, 
            order_id, 
            full_name, 
            email, 
            phone, 
            address_line1, 
            address_line2, 
            city, 
            state, 
            postal_code, 
            country, 
            company_name, 
            tax_id, 
            created_at, 
            updated_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, order_id, full_name, email, phone, address_line1, address_line2, city, state, postal_code, country, company_name, tax_id, created_at, updated_at])
    return response.rows[0]
}

// Wishlists -
const createWishlist = async({name})=> {
    const SQL = /*sql*/ `
        INSERT INTO wishlists(
            id, 
            user_id, 
            name, 
            is_shared, 
            created_at
        ) VALUES($1, $2, $3, $4, $5) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, name, is_shared, created_at])
    return response.rows[0]
}

// WishlistItems -
const createWishlistItem = async()=> {
    const SQL = /*sql*/ `
        INSERT INTO wishlist_items(
            wishlist_id,
            product_id,
        ) VALUES($1, $2) RETURN *;
    `;
    const response = await client.query(SQL, [uuid.v4(), ])
    return response.rows[0]
}
module.exports = {
  client,
  connectDB,
  createTables,
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
  createWishlistItem
}
