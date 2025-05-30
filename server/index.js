const {client, connectDB, createTables, createUser, authenticateUser } = require("./db.js");
const { seedFakeData } = require("./seed.js");

const cors = require('cors');

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path")

// import the routes from api.js
const router = require('./api')

const corsOptions = {
  origin: ['http://localhost:5173', 'https://group2capstone-ecommerce.onrender.com'],
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'], // Make sure Authorization is allowed
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.static(path.join(__dirname, '../client/dist')))

//to use /api as root path
app.use('/api', router)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})
const init = async () => {
  await connectDB();
  await createTables();
  await seedFakeData();

  console.log('----------')
  console.log('Admins: Ellie, Oliver');
  console.log('Helpful CURL commands to test:');
  console.log(`curl -X POST https://group2capstone-ecommerce.onrender.com/api/auth/register -H "Content-Type: application/json" -d '{"username":"megan","email":"megan@megan.com","password":"megan_pw","is_admin":false,"mailing_address":"123 Main St, Springfield","phone":"555-123-4567"}'`);
  console.log(`curl -X POST https://group2capstone-ecommerce.onrender.com/api/auth/login -H "Content-Type: application/json" -d '{"username": "megan", "password": "megan_pw"}'`);
  console.log(`curl -X DELETE https://group2capstone-ecommerce.onrender.com/api/cart/PRODUCT_ID_HERE -H "Authorization: Bearer ACCESS_TOKEN_HERE"`);
  console.log(`curl -X PUT https://group2capstone-ecommerce.onrender.com/api/cart/PRODUCT_ID_HERE -H "Authorization: Bearer ACCESS_TOKEN_HERE" -H "Content-Type: application/json" -d '{"quantity": 2}'`);  

  console.log('----------');
  
  app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});
}

init();
