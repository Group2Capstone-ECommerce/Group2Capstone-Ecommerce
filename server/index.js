const {client, connectDB, createTables, createUser } = require("./db.js");
const { seedData } = require("./seed.js");

const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

const init = async () => {
  connectDB();
  createTables();
  
  console.log('----------')
  console.log('Helpful CURL commands to test:');
  console.log(`curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"megan","email":"megan@megan.com","password":"megan_pw","is_admin":false,"mailing_address":"123 Main St, Springfield","phone":"555-123-4567"}'`);
  console.log('----------');

  app.listen(port, () => console.log(`listening on PORT ${port}`));
}

// POST /api/auth/register route
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { email, username, password, is_admin, mailing_address, phone } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username, password are required" });
    }

    // Check if user already exists in users database
    const checkUserSQL = `
      SELECT * FROM users WHERE email = $1 OR username = $2;
    `;
    const checkResponse = await client.query(checkUserSQL, [email, username]);

    if (checkResponse.rows.length > 0) {
      return res.status(400).json({ error: "User with this email or username already exists." });
    }

    const newUser = await createUser({ email, username, password_hash: password, is_admin, mailing_address, phone });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
  }
});

init();