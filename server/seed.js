const express = require ('express')
const uuid = require('uuid')

const {client} = require('./db') 

// Products -
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