import 'dotenv/config';
import pool from './src/config/db.js';

try {
  await pool.query(`
    ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS story TEXT NULL
  `);
  console.log('story column added to campaigns table');
  process.exit(0);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
