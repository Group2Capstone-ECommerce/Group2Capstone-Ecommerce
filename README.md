# Group2Capstone-Ecommerce

## Database Schema: Visual Diagram

<img width="1444" alt="Screenshot 2025-04-10 at 3 32 05 PM" src="https://github.com/user-attachments/assets/f55aaf35-6feb-47bb-b9b5-d918deb3147d" />

## Database Schema: Tables & Reationships

### PRODUCTS(stores products info)
```sql
-- create a products table to storage all the products info
CREATE TABLE products(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name VARCHAR(100) NOT NULL,
    descriptions TEXT,
    price NUMERIC(10, 2) NOT NULL,
    tags TEXT[], --array of product tags
    image_urls TEXT[], -- optional array of image URLs
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```


### USERS(store users info)
```sql
-- create a users table to storage all users info
CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    mailing_address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```


### CATEGORIES
```sql
-- create a general categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);
```

```sql
-- create a product-category table to join - many to many, so that one product can have multiple categories, also benefits sorting products by categories
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT unique_product_catagories UNIQUE (product_id, category_id)
);
```


### CART & CART ITEMS
```sql
-- create the cart table 
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

```sql
-- join table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updatd_at TIMESTAMP DEFAULT NOW()
);
```

### ORDERS
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Created',
    total_price NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC(10, 2) NOT NULL
);
```


### BILLING
```sql
-- create a billing table
CREATE TABLE billing_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who the billing info belongs to
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Optional: connected to a specific order
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Billing details
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,

  -- Optional extra details
  company_name VARCHAR(100),
  tax_id VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```


### WISHLIST(Optional for TIER 1!)
```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wishlist_items (
    wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    CONSTRAINT unique_whishlist_product UNIQUE (wishlist_id, product_id)
);
```


### REVIEWS (Optional for TIER 1!)
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## TIPS

--`gen_random_uuid()` : Automatically generate a unique ID for each row in a table.

--`NUMERIC` : Allows demical numers

--`ON DELETE CASCADE` : Foreign key constraints. Automatically delete child rows when parent is deleted.

--`UNIQUE` : Constrain, to make sure the value is unique.

--`CHECK (quantity > 0)` : Constrain, only allow rows where the quantity is greater than 0.

