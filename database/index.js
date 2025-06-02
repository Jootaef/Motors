const { Pool } = require("pg");
require("dotenv").config();

// Debug logging
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 20));

// Configuración universal que funciona en ambos entornos
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { 
    rejectUnauthorized: false 
  } : false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

const pool = new Pool(poolConfig);

// Verificación de conexión al iniciar
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
})();

// Exportación consistente
module.exports = {
  async query(text, params) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Error in query', { text, error });
      throw error;
    }
  },
  pool // Exportar el pool directamente si es necesario
};