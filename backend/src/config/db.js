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

  await pool.query(`
    DO $$
    BEGIN
      CREATE TYPE pledge_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END
    $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pledges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      donateur_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      amount INTEGER NOT NULL CHECK (amount > 0),
      status pledge_status NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_pledges_campaign_id ON pledges (campaign_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_pledges_donateur_id ON pledges (donateur_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_pledges_status ON pledges (status)
  `);
};

export const dbReady = initializeDatabase().catch((err) => {
  console.error("PostgreSQL initialization failed:", err.message);
  process.exit(1);
});

export default pool;
