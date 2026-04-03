import 'dotenv/config';
import pool from './src/config/db.js';

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_campaigns (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, campaign_id)
    )
  `);
  console.log('saved_campaigns table created');
  process.exit(0);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
