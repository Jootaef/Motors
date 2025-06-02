const { Pool } = require("pg");
require("dotenv").config();

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 20));

const requiresSSL = process.env.DATABASE_URL?.includes("render.com") || process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(requiresSSL && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

module.exports = {
  async query(text, params) {
    try {
      const result = await pool.query(text, params);
      if (process.env.NODE_ENV === "development") {
        console.log("executed query", { text });
      }
      return result;
    } catch (err) {
      console.error("Database query error:", text);
      throw err;
    }
  },
  pool,
};
