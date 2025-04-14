const express = require('express');
const uuid = require('uuid');

const {
    pool,
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
} = require('./db.js');

async function seedFakeData() {
    try {
      await pool.connect();
  
      // PRODUCTS
      const [
        shoes, shirts, shorts, sweaters, pants, socks, jackets, belts, hoodies,
        winter_shoes, winter_shirts, winter_jackets, winter_pants,
        summer_shoes, summer_shorts, summer_shirts, summer_pants
        ] = await Promise.all([
        createProduct({ product_name: 'shoes', descriptions: 'casual shoes', price: '20',  stock_quantity: '12' }),
        createProduct({ product_name: 'shirts', descriptions: 'casual shirt', price: '15',  stock_quantity: '32' }),
        createProduct({ product_name: 'shorts', descriptions: 'casual shorts', price: '12',  stock_quantity: '56' }),
        createProduct({ product_name: 'sweaters', descriptions: 'casual sweater', price: '25',  stock_quantity: '23' }),
        createProduct({ product_name: 'pants', descriptions: 'casual pants', price: '20',  stock_quantity: '61' }),
        createProduct({ product_name: 'Socks', descriptions: 'casual socks', price: '10',  stock_quantity: '42' }),
        createProduct({ product_name: 'jackets', descriptions: 'casual jackets', price: '35',  stock_quantity: '13' }),
        createProduct({ product_name: 'belts', descriptions: 'casual belts', price: '17',  stock_quantity: '29' }),
        createProduct({ product_name: 'hoodies', descriptions: 'casual hoodies', price: '30',  stock_quantity: '30' }),
        createProduct({ product_name: 'winter shoes', descriptions: 'winter shoes', price: '20',  stock_quantity: '19' }),
        createProduct({ product_name: 'winter shirts', descriptions: 'winter shirt', price: '20',  stock_quantity: '28' }),
        createProduct({ product_name: 'winter jackets', descriptions: 'winter jacket', price: '20',  stock_quantity: '22' }),
        createProduct({ product_name: 'winter pants', descriptions: 'winter pants', price: '20',  stock_quantity: '25' }),
        createProduct({ product_name: 'summer shoes', descriptions: 'summer shoes', price: '20',  stock_quantity: '12' }),
        createProduct({ product_name: 'summer shorts', descriptions: 'summer shorts', price: '12',  stock_quantity: '21' }),
        createProduct({ product_name: 'summer shirts', descriptions: 'summer shirts', price: '15',  stock_quantity: '41' }),
        createProduct({ product_name: 'summer pants', descriptions: 'summer pants', price: '20',  stock_quantity: '23' }),
      ]);

      // USERS
      console.log("Clearing existing users...");
      await pool.query('DELETE FROM users');

      const [bob, ellie, jack, donna, rick, lisa, denise, oliver, samuel, wendy] = await Promise.all([
        createUser({username: 'Bob', email: 'bob@email.com', password_hash: 'bob_pw', is_admin: false, mailing_address: 'bobmailingaddress', phone: '219-555-9235'}),
        createUser({username: 'Ellie', email: 'Ellie@email.com', password_hash: 'ellie_pw', is_admin: true, mailing_address: 'elliemailingaddress', phone: '832-555-6172'}),
        createUser({username: 'Jack', email: 'Jack@email.com', password_hash: 'jack_pw', is_admin: false, mailing_address: 'jackmailingaddress', phone: '926-555-0151'}),
        createUser({username: 'Donna', email: 'Donna@email.com', password_hash: 'donna_pw', is_admin: false, mailing_address: 'donnamailingaddress', phone: '162-555-8458'}),
        createUser({username: 'Rick', email: 'Rick@gmail.com', password_hash: 'rick_pw', is_admin: false, mailing_address: 'rickmailingaddress', phone: '293-555-1932'}),
        createUser({username: 'Lisa', email: 'Lisa@email.com', password_hash: 'lisa_pw', is_admin: false, mailing_address: 'lisamailingaddress', phone: '816-555-4152'}),
        createUser({username: 'Denise', email: 'Denise@email.com', password_hash: 'denise_pw', is_admin: false, mailing_address: 'denisemailingaddress', phone: '173-555-3047'}),
        createUser({username: 'Oliver', email: 'Oliver@email.com', password_hash: 'oliver_pw', is_admin: true, mailing_address: 'olivermailingaddress', phone: '891-555-6327'}),
        createUser({username: 'Samuel', email: 'Samuel@email.com', password_hash: 'samuel_pw', is_admin: false, mailing_address: 'samuelmailingaddress', phone: '216-555-1840'}),
        createUser({username: 'Wendy', email: 'Wendy@email.com', password_hash: 'wendy_pw', is_admin: false, mailing_address: 'wendymailingaddress', phone: '252-555-1047'}),
    ])

    // CATEGORIES
    console.log("Clearing existing categories...");
    await pool.query('DELETE FROM categories');
    const categories = await createCategories([
        "On Sale",
        "Casual",
        "Summer",
        "Winter",
        "All Products"
      ]);
      const [onSale, casual, summer, winter, allProducts] = categories;

    // Product Categories -
    await Promise.all([
        createProductCategory({product_id: socks.id, category_id: onSale.id}),
        createProductCategory({product_id: shorts.id, category_id: onSale.id}),
        createProductCategory({product_id: summer_shorts.id, category_id: onSale.id}),
        createProductCategory({product_id: shoes.id,category_id: casual.id}),
        createProductCategory({product_id: shirts.id,category_id: casual.id}),
        createProductCategory({product_id: shorts.id,category_id: casual.id}),
        createProductCategory({product_id: sweaters.id,category_id: casual.id}),
        createProductCategory({product_id: pants.id,category_id: casual.id}),
        createProductCategory({product_id: socks.id,category_id: casual.id}),
        createProductCategory({product_id: jackets.id,category_id: casual.id}),
        createProductCategory({product_id: belts.id,category_id: casual.id}),
        createProductCategory({product_id: hoodies.id,category_id: casual.id}),
        createProductCategory({product_id: summer_shoes.id,category_id: summer.id}),
        createProductCategory({product_id: summer_shirts.id,category_id: summer.id}),
        createProductCategory({product_id: summer_shorts.id,category_id: summer.id}),
        createProductCategory({product_id: summer_pants.id,category_id: summer.id}),
        createProductCategory({product_id: winter_shoes.id,category_id: winter.id}),
        createProductCategory({product_id: winter_shirts.id,category_id: winter.id}),
        createProductCategory({product_id: winter_jackets.id,category_id: winter.id}),
        createProductCategory({product_id: winter_pants.id,category_id: winter.id}),
        createProductCategory({product_id: shoes.id,category_id: allProducts.id}),
        createProductCategory({product_id: shirts.id,category_id: allProducts.id}),
        createProductCategory({product_id: shorts.id,category_id: allProducts.id}),
        createProductCategory({product_id: sweaters.id,category_id: allProducts.id}),
        createProductCategory({product_id: pants.id,category_id: allProducts.id}),
        createProductCategory({product_id: socks.id,category_id: allProducts.id}),
        createProductCategory({product_id: jackets.id,category_id: allProducts.id}),
        createProductCategory({product_id: belts.id,category_id: allProducts.id}),
        createProductCategory({product_id: hoodies.id,category_id: allProducts.id}),
        createProductCategory({product_id: summer_shoes.id,category_id: allProducts.id}),
        createProductCategory({product_id: summer_shirts.id,category_id: allProducts.id}),
        createProductCategory({product_id: summer_shorts.id,category_id: allProducts.id}),
        createProductCategory({product_id: summer_pants.id,category_id: allProducts.id}),
        createProductCategory({product_id: winter_shoes.id,category_id: allProducts.id}),
        createProductCategory({product_id: winter_shirts.id,category_id: allProducts.id}),
        createProductCategory({product_id: winter_jackets.id,category_id: allProducts.id}),
        createProductCategory({product_id: winter_pants.id,category_id: allProducts.id}),
    ])

    // CARTS
    const [cartBob, cartJack, cartRick, cartOliver] = await Promise.all([
        createCart(bob.id, true),
        createCart(jack.id, true),
        createCart(rick.id, true),
        createCart(oliver.id, true)
    ]);

    // CART ITEMS
    await Promise.all([
        createCartItem(cartBob.id, shoes.id, 1, new Date(), new Date()),
        createCartItem(cartBob.id, socks.id, 3, new Date(), new Date()),
        createCartItem(cartJack.id, shorts.id, 1, new Date(), new Date()),
        createCartItem(cartJack.id, socks.id, 7, new Date(), new Date()),
        createCartItem(cartJack.id, shirts.id, 2, new Date(), new Date()),
        createCartItem(cartJack.id, summer_shoes.id, 1, new Date(), new Date()),
        createCartItem(cartRick.id, summer_shirts.id, 1, new Date(), new Date()),
        createCartItem(cartRick.id, shirts.id, 3, new Date(), new Date())
    ]);

    // ORDERS
    const now = new Date();
    const [order1, order2, order3, order4] = await Promise.all([
        createOrder(bob.id, cartBob.id, 'Created', 42.67, now, now),
        createOrder(jack.id, cartJack.id, 'Created', 25.93, now, now),
        createOrder(rick.id, cartRick.id, 'Created', 34.22, now, now),
        createOrder(oliver.id, cartOliver.id, 'Created', 30.74, now, now),
    ]);

    // ORDER ITEMS
    await Promise.all([
        createOrderItem({order_id: order1.id, product_id: shoes.id, quantity: 1, price_at_purchase: 20}),
        createOrderItem({order_id: order1.id, product_id: belts.id, quantity: 2, price_at_purchase: 34}),
        createOrderItem({order_id: order1.id, product_id: summer_shorts.id, quantity: 1, price_at_purchase: 12}),
        createOrderItem({order_id: order2.id, product_id: shirts.id, quantity: 3, price_at_purchase: 45}),
        createOrderItem({order_id: order2.id, product_id: socks.id, quantity: 1, price_at_purchase: 10}),
        createOrderItem({order_id: order2.id, product_id: summer_shoes.id, quantity: 2, price_at_purchase: 40}),
        createOrderItem({order_id: order3.id, product_id: shirts.id, quantity: 3, price_at_purchase: 45}),
        createOrderItem({order_id: order4.id, product_id: pants.id, quantity: 1, price_at_purchase: 20}),
        createOrderItem({order_id: order4.id, product_id: socks.id, quantity: 4, price_at_purchase: 40}),
        createOrderItem({order_id: order4.id, product_id: hoodies.id, quantity: 1, price_at_purchase: 30}),

    ])

    // BILLING INFO
    await Promise.all([
        createBillingInfo({user_id: bob.id, order_id: order1.id, full_name: 'Bobert B Bern', email: 'bob@email.com', phone: '219-555-9235', address_line1: 'bobaddress1', address_line2: 'bobaddress2', city: 'New York City', state: 'NY', postal_code: '29173', country: 'US', company_name: 'company', tax_id: 'id'}),
        createBillingInfo({user_id: jack.id, order_id: order2.id, full_name: 'Jack Hilton', email: 'jack@email.com', phone: '926-555-0151', address_line1: 'jackaddress1', address_line2: 'jackaddress2', city: 'Atlanta', state: 'Georgia', postal_code: '92106', country: 'US', company_name: 'company', tax_id: 'id'}),
        createBillingInfo({user_id: rick.id, order_id: order3.id, full_name: 'Rick Wilson', email: 'rick@email.com', phone: '293-555-1932', address_line1: 'rickaddress1', address_line2: 'rickaddress2', city: 'New Orleans', state: 'Luisiana', postal_code: '19086', country: 'US', company_name: 'company', tax_id: 'id'}),
        createBillingInfo({user_id: oliver.id, order_id: order4.id, full_name: 'Oliver White', email: 'oliver@email.com', phone: '891-555-6327', address_line1: 'oliveraddress1', address_line2: 'oliveraddress2', city: 'Detroit', state: 'Michigan', postal_code: '30721', country: 'US', company_name: 'company', tax_id: 'id'}),

    ])

    // WISHLISTS
    const[wishlist1, wishlist2, wishlist3, wishlist4, wishlist5] = await Promise.all([
        createWishlist({user_id: ellie.id, name: 'favorites', is_shared: false}),
        createWishlist({user_id: lisa.id, name: 'summer party', is_shared: false}),
        createWishlist({user_id: denise.id, name: 'want-it List', is_shared: false}),
        createWishlist({user_id: samuel.id, name: 'favorites', is_shared: false}),
        createWishlist({user_id: wendy.id, name: 'winter clothes', is_shared: false}),
    ]);

    // WISHLIST ITEMS
    await Promise.all([
        createWishlistItem( wishlist1.id, shoes.id),
        createWishlistItem( wishlist1.id, shirts.id),
        createWishlistItem( wishlist1.id, socks.id),
        createWishlistItem( wishlist2.id, summer_shirts.id),
        createWishlistItem( wishlist2.id , winter_jackets.id),
        createWishlistItem( wishlist3.id, shirts.id),
        createWishlistItem( wishlist3.id, summer_pants.id),
        createWishlistItem( wishlist4.id, shorts.id),
        createWishlistItem( wishlist4.id, socks.id),
        createWishlistItem( wishlist5.id, summer_shorts.id),
    ]);

    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        await pool.end();
    }
}

module.exports = {
    seedFakeData
}