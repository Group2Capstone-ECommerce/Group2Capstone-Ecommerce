const {client, connectDB, createTables } = require("./db.js");
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

init();