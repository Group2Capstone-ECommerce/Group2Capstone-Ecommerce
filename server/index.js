const {client, connectDB, createTables} = require("./db.js");
const { seedData } = require("./seed.js");

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
  
  console.log('----------')
  console.log('Helpful CURL commands to test:');
  console.log(`curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"megan","email":"megan@megan.com","password":"megan_pw","is_admin":false,"mailing_address":"123 Main St, Springfield","phone":"555-123-4567"}'`);
  console.log(`curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username": "megan", "password": "megan_pw"}'`);
  console.log('----------');
  
  app.listen(port, () => console.log(`listening on PORT ${port}`));
}

init();