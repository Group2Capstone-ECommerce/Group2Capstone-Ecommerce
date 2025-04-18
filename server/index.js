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
  console.log("init() starting...");

  connectDB();
  console.log("DB connected");

  createTables();
  console.log("Tables created");

  seedFakeData();
  console.log("Fake data seeded");

  console.log('Server about to start');


  console.log('----------')
  console.log('Helpful CURL commands to test:');
  console.log(`curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"megan","email":"megan@megan.com","password":"megan_pw","is_admin":false,"mailing_address":"123 Main St, Springfield","phone":"555-123-4567"}'`);
  console.log(`curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username": "megan", "password": "megan_pw"}'`);
  console.log(`curl -X DELETE http://localhost:3000/api/cart/PRODUCT_ID_HERE -H "Authorization: Bearer ACCESS_TOKEN_HERE"`);
  console.log(`curl -X PUT http://localhost:3000/api/cart/PRODUCT_ID_HERE -H "Authorization: Bearer ACCESS_TOKEN_HERE" -H "Content-Type: application/json" -d '{"quantity": 2}'`);  

  console.log('----------');
  
  app.listen(port, () => console.log(`listening on PORT ${port}`));
}

init();
