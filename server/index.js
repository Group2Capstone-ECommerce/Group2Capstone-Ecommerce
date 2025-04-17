const {client, connectDB, createTables, createUser, authenticateUser } = require("./db.js");
const { seedFakeData } = require("./seed.js");

const express = require("express");
const app = express();
const port = 3000;
// import the routes from api.js
const router = require('./api')

app.use(express.json());

//to use /api as root path
app.use('/api', router)
const init = async () => {
  connectDB();
  createTables();
  seedFakeData();

  console.log('----------')
  console.log('Helpful CURL commands to test:');
  console.log(`Seeded Admins: Ellie and Oliver`);
  console.log(`Users with carts: Jack, Bob, Rick, Oliver`);
  console.log(`curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"megan","email":"megan@megan.com","password":"megan_pw","is_admin":false,"mailing_address":"123 Main St, Springfield","phone":"555-123-4567"}'`);
  console.log(`curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username": "Ellie", "password": "ellie_pw"}'`);
  console.log(`curl -X DELETE http://localhost:3000/api/cart/PRODUCT_ID_HERE -H "Authorization: Bearer ACCESS_TOKEN_HERE"`);
  console.log(`curl -X PUT http://localhost:3000/api/cart/PRODUCT_ID_HERE -H "Authorization: Bearer ACCESS_TOKEN_HERE" -H "Content-Type: application/json" -d '{"quantity": 2}'`);  
  console.log(`curl -X POST http://localhost:3000/api/admin/products -H "Authorization: Bearer ACCESS_TOKEN_HERE" -H "Content-Type: application/json" -d '{"product_name": "Bouncy Ball", "price": 1, "descriptions": "Very bouncy!", "stock_quantity": 100}'`);
  console.log(`curl -X GET http://localhost:3000/api/products`);
  console.log('----------');
  
  app.listen(port, () => console.log(`listening on PORT ${port}`));
}

init();

// curl -X POST http://localhost:3000/api/admin/products -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTk3NjJjLWMzN2ItNDdjYS04Y2U1LWE1ZjA1NTIyMThjMCIsImlhdCI6MTc0NDg0ODAzNX0.2qcd4lleV8j2aMKeIbFYRGXJvGiBI07v4XK7B_T-pqg" -H "Content-Type: application/json" -d '{"product_name": "Bouncy Ball", "price": 1, "descriptions": "Very bouncy!", "stock_quantity": 100}'