const {client, connectDB, createTables, createUser } = require("./db.js");
const { seedData } = require("./seed.js");

const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

const init = async () => {
  connectDB();
  createTables();
  
  app.listen(port, () => console.log(`listening on PORT ${port}`));
}

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { email, username, password, is_admin, mailing_address, phone } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username, password are required" });
    }
    const newUser = await createUser({ email, username, password_hash: password, is_admin, mailing_address, phone });
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "23505") {
      // Handle unique constraint violation (e.g., duplicate username)
      res.status(409).json({ error: "Username already exists" });
    } else {
      next(error);
    }
  }
});

init();