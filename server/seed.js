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

      console.log("Beginning to seed data...")
  
      // PRODUCTS
      const [
        tshirt,
        jeans,
        dress,
        skirt,
        hoodie,
        sweater,
        jacket,
        coat,
        shorts,
        leggings,
        socksPack,
        beanie,
        scarf,
        gloves,
        belt,
        sneakers,
        sandals,
        boots,
        pajamas,
        swimwear
        ] = await Promise.all([
            createProduct({ product_name: 'T-Shirt',         descriptions: 'Cotton crew neck',         price: 19.99, stock_quantity: 34, image_url: '' }),
            createProduct({ product_name: 'Jeans',           descriptions: 'Slim fit denim',           price: 49.50, stock_quantity: 29, image_url: '' }),
            createProduct({ product_name: 'Dress',           descriptions: 'Floral summer dress',      price: 59.75, stock_quantity: 15, image_url: 'https://i.pinimg.com/736x/2b/a8/3d/2ba83d39d5393a7ecf4db8d1da92a472.jpg' }),
            createProduct({ product_name: 'Skirt',           descriptions: 'A-line midi skirt',        price: 39.20, stock_quantity: 27, image_url: '' }),
            createProduct({ product_name: 'Hoodie',          descriptions: 'Fleece pullover',          price: 29.95, stock_quantity: 22, image_url: '' }),
            createProduct({ product_name: 'Sweater',         descriptions: 'Cable knit sweater',       price: 45.10, stock_quantity: 18, image_url: '' }),
            createProduct({ product_name: 'Jacket',          descriptions: 'Lightweight bomber',       price: 79.99, stock_quantity: 12, image_url: '' }),
            createProduct({ product_name: 'Coat',            descriptions: 'Wool trench coat',         price: 99.49, stock_quantity:  8, image_url: '' }),
            createProduct({ product_name: 'Shorts',          descriptions: 'Chino casual shorts',      price: 24.30, stock_quantity: 31, image_url: '' }),
            createProduct({ product_name: 'Leggings',        descriptions: 'High-waist activewear',    price: 27.60, stock_quantity: 21, image_url: '' }),
            createProduct({ product_name: 'Socks Pack',      descriptions: '3-pack crew socks',        price: 12.99, stock_quantity: 45, image_url: '' }),
            createProduct({ product_name: 'Beanie',          descriptions: 'Knit winter beanie',       price: 15.00, stock_quantity: 20, image_url: '' }),
            createProduct({ product_name: 'Scarf',           descriptions: 'Soft cashmere scarf',      price: 22.45, stock_quantity: 25, image_url: '' }),
            createProduct({ product_name: 'Gloves',          descriptions: 'Leather touchscreen',      price: 17.80, stock_quantity: 28, image_url: '' }),
            createProduct({ product_name: 'Belt',            descriptions: 'Genuine leather belt',     price: 18.75, stock_quantity: 19, image_url: '' }),
            createProduct({ product_name: 'Sneakers',        descriptions: 'Retro lace-up shoes',      price: 65.99, stock_quantity: 14, image_url: '' }),
            createProduct({ product_name: 'Sandals',         descriptions: 'Foam slide sandals',       price: 28.50, stock_quantity: 32, image_url: '' }),
            createProduct({ product_name: 'Boots',           descriptions: 'Ankle leather boots',      price: 89.95, stock_quantity:  9, image_url: '' }),
            createProduct({ product_name: 'Pajamas',         descriptions: 'Cotton sleep set',         price: 35.20, stock_quantity: 16, image_url: '' }),
            createProduct({ product_name: 'Swimwear',        descriptions: 'One-piece swimsuit',       price: 45.99, stock_quantity: 23, image_url: '' })
          ])

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
        createProductCategory({product_id: sweater.id, category_id: onSale.id}),
        createProductCategory({product_id: shorts.id, category_id: onSale.id}),
        createProductCategory({product_id: beanie.id, category_id: onSale.id}),
        createProductCategory({product_id: jeans.id,category_id: casual.id}),
        createProductCategory({product_id: dress.id,category_id: casual.id}),
        createProductCategory({product_id: shorts.id,category_id: casual.id}),
        createProductCategory({product_id: pajamas.id,category_id: casual.id}),
        createProductCategory({product_id: hoodie.id,category_id: casual.id}),
        createProductCategory({product_id: beanie.id,category_id: casual.id}),
        createProductCategory({product_id: sweater.id,category_id: casual.id}),
        createProductCategory({product_id: tshirt.id,category_id: casual.id}),
        createProductCategory({product_id: scarf.id,category_id: casual.id}),
        createProductCategory({product_id: belt.id,category_id: summer.id}),
        createProductCategory({product_id: sandals.id,category_id: summer.id}),
        createProductCategory({product_id: swimwear.id,category_id: summer.id}),
        createProductCategory({product_id: dress.id,category_id: summer.id}),
        createProductCategory({product_id: scarf.id,category_id: winter.id}),
        createProductCategory({product_id: sweater.id,category_id: winter.id}),
        createProductCategory({product_id: jacket.id,category_id: winter.id}),
        createProductCategory({product_id: coat.id,category_id: winter.id}),
        createProductCategory({product_id: tshirt.id,category_id: allProducts.id}),
        createProductCategory({product_id: jeans.id,category_id: allProducts.id}),
        createProductCategory({product_id: dress.id,category_id: allProducts.id}),
        createProductCategory({product_id: skirt.id,category_id: allProducts.id}),
        createProductCategory({product_id: hoodie.id,category_id: allProducts.id}),
        createProductCategory({product_id: sweater.id,category_id: allProducts.id}),
        createProductCategory({product_id: jacket.id,category_id: allProducts.id}),
        createProductCategory({product_id: coat.id,category_id: allProducts.id}),
        createProductCategory({product_id: shorts.id,category_id: allProducts.id}),
        createProductCategory({product_id: leggings.id,category_id: allProducts.id}),
        createProductCategory({product_id: socksPack.id,category_id: allProducts.id}),
        createProductCategory({product_id: beanie.id,category_id: allProducts.id}),
        createProductCategory({product_id: scarf.id,category_id: allProducts.id}),
        createProductCategory({product_id: gloves.id,category_id: allProducts.id}),
        createProductCategory({product_id: belt.id,category_id: allProducts.id}),
        createProductCategory({product_id: sandals.id,category_id: allProducts.id}),
        createProductCategory({product_id: boots.id,category_id: allProducts.id}),
        createProductCategory({product_id: pajamas.id,category_id: allProducts.id}),
        createProductCategory({product_id: swimwear.id,category_id: allProducts.id}),
    ])

    // CARTS
    const [cartBob, cartJack, cartRick] = await Promise.all([
        createCart(bob.id, true),
        createCart(jack.id, true),
        createCart(rick.id, true)
    ]);

    // CART ITEMS
    await Promise.all([
        createCartItem(cartBob.id, sweater.id, 1, new Date(), new Date()),
        createCartItem(cartBob.id, beanie.id, 3, new Date(), new Date()),
        createCartItem(cartJack.id, jeans.id, 1, new Date(), new Date()),
        createCartItem(cartJack.id, sandals.id, 7, new Date(), new Date()),
        createCartItem(cartJack.id, hoodie.id, 2, new Date(), new Date()),
        createCartItem(cartJack.id, coat.id, 1, new Date(), new Date()),
        createCartItem(cartRick.id, socksPack.id, 1, new Date(), new Date()),
        createCartItem(cartRick.id, swimwear.id, 3, new Date(), new Date())
    ]);

    // ORDERS
    const now = new Date();
    const [order1, order2, order3] = await Promise.all([
        createOrder(bob.id, cartBob.id, 'Created', 60.10, now, now),
        createOrder(jack.id, cartJack.id, 'Created', 207.44, now, now),
        createOrder(rick.id, cartRick.id, 'Created', 58.99, now, now),
    ]);

    // ORDER ITEMS
    await Promise.all([
        // Bob’s order (order1) – from his cart: sweater & beanie
        createOrderItem({
          order_id: order1.id,
          product_id: sweater.id,
          quantity: 1,
          price_at_purchase: 45.10
        }),
        createOrderItem({
          order_id: order1.id,
          product_id: beanie.id,
          quantity: 3,
          price_at_purchase: 15.00
        }),
      
        // Jack’s order (order2) – from his cart: jeans, sandals, hoodie & coat
        createOrderItem({
          order_id: order2.id,
          product_id: jeans.id,
          quantity: 1,
          price_at_purchase: 49.50
        }),
        createOrderItem({
          order_id: order2.id,
          product_id: sandals.id,
          quantity: 7,
          price_at_purchase: 28.50
        }),
        createOrderItem({
          order_id: order2.id,
          product_id: hoodie.id,
          quantity: 2,
          price_at_purchase: 29.95
        }),
        createOrderItem({
          order_id: order2.id,
          product_id: coat.id,
          quantity: 1,
          price_at_purchase: 99.49
        }),
      
        // Rick’s order (order3) – from his cart: socksPack & swimwear
        createOrderItem({
          order_id: order3.id,
          product_id: socksPack.id,
          quantity: 1,
          price_at_purchase: 12.99
        }),
        createOrderItem({
          order_id: order3.id,
          product_id: swimwear.id,
          quantity: 3,
          price_at_purchase: 45.99
        })
      ]);

    // BILLING INFO
    await Promise.all([
        createBillingInfo({user_id: bob.id, order_id: order1.id, full_name: 'Bobert B Bern', email: 'bob@email.com', phone: '219-555-9235', address_line1: 'bobaddress1', address_line2: 'bobaddress2', city: 'New York City', state: 'NY', postal_code: '29173', country: 'US', company_name: 'company', tax_id: 'id'}),
        createBillingInfo({user_id: jack.id, order_id: order2.id, full_name: 'Jack Hilton', email: 'jack@email.com', phone: '926-555-0151', address_line1: 'jackaddress1', address_line2: 'jackaddress2', city: 'Atlanta', state: 'Georgia', postal_code: '92106', country: 'US', company_name: 'company', tax_id: 'id'}),
        createBillingInfo({user_id: rick.id, order_id: order3.id, full_name: 'Rick Wilson', email: 'rick@email.com', phone: '293-555-1932', address_line1: 'rickaddress1', address_line2: 'rickaddress2', city: 'New Orleans', state: 'Luisiana', postal_code: '19086', country: 'US', company_name: 'company', tax_id: 'id'}),
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
        // Wishlist 1: ellie's favorites
        createWishlistItem(wishlist1.id, sneakers.id),
        createWishlistItem(wishlist1.id, tshirt.id),
        createWishlistItem(wishlist1.id, leggings.id),
        createWishlistItem(wishlist1.id, coat.id),
      
        // Wishlist 2: lisa's summer party
        createWishlistItem(wishlist2.id, swimwear.id),
        createWishlistItem(wishlist2.id, shorts.id),
        createWishlistItem(wishlist2.id, sandals.id),
        createWishlistItem(wishlist2.id, dress.id),
      
        // Wishlist 3: denise's want-it list
        createWishlistItem(wishlist3.id, jeans.id),
        createWishlistItem(wishlist3.id, belt.id),
        createWishlistItem(wishlist3.id, hoodie.id),
        createWishlistItem(wishlist3.id, sweater.id),
      
        // Wishlist 4: samuel's favorites
        createWishlistItem(wishlist4.id, jacket.id),
        createWishlistItem(wishlist4.id, beanie.id),
        createWishlistItem(wishlist4.id, scarf.id),
        createWishlistItem(wishlist4.id, gloves.id),
      
        // Wishlist 5: wendy's winter clothes
        createWishlistItem(wishlist5.id, coat.id),
        createWishlistItem(wishlist5.id, jacket.id),
        createWishlistItem(wishlist5.id, scarf.id),
        createWishlistItem(wishlist5.id, sweater.id),
      ]);

      console.log("Finished seeding data.");
    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        
    }
}

module.exports = {
    seedFakeData
}