import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const initializeDatabase = async () => {
  await pool.query("SELECT NOW()");
  console.log("PostgreSQL connected successfully");

  await pool.query(`
    ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS story TEXT NULL
  `);
};

export const dbReady = initializeDatabase().catch((err) => {
  console.error("PostgreSQL initialization failed:", err.message);
  process.exit(1);
});

export default pool;
