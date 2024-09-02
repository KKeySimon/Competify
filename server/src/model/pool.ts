require("dotenv").config();

import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  user: process.env.DB_USERNAME,
  database: "competify",
  password: process.env.DB_PASSWORD,
  port: 5432, // The default port
});

export default pool;
