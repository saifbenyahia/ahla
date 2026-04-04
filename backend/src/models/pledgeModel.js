import pool from "../config/db.js";

export const createPledge = async ({ campaignId, donorId, amount, status = "SUCCESS" }) => {
  const { rows } = await pool.query(
    `INSERT INTO pledges (campaign_id, donateur_id, amount, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, campaign_id, donateur_id, amount, status, created_at`,
    [campaignId, donorId, amount, status]
  );

  return rows[0] || null;
};

export const findSupportedCampaignsByDonor = async (donorId) => {
  const { rows } = await pool.query(
    `SELECT
       c.id,
       c.porteur_id,
       c.title,
       c.description,
       c.category,
       c.target_amount,
       c.status,
       c.rewards,
       c.story,
       c.image_url,
       c.video_url,
       c.created_at,
       c.updated_at,
       u.name AS creator_name,
       u.email AS creator_email,
       COUNT(p.id)::int AS pledge_count,
       COALESCE(SUM(p.amount), 0)::int AS total_contributed,
       MAX(p.created_at) AS last_supported_at,
       COALESCE(ps.amount_raised, 0)::int AS amount_raised,
       COALESCE(ps.backer_count, 0)::int AS backer_count,
       CASE
         WHEN c.target_amount > 0 THEN LEAST(
           ROUND((COALESCE(ps.amount_raised, 0)::numeric / c.target_amount::numeric) * 100),
           100
         )::int
         ELSE 0
       END AS funded_percent
     FROM pledges p
     JOIN campaigns c ON c.id = p.campaign_id
     JOIN users u ON u.id = c.porteur_id
     LEFT JOIN (
       SELECT
         campaign_id,
         COALESCE(SUM(amount), 0) AS amount_raised,
         COUNT(*) AS backer_count
       FROM pledges
       WHERE status = 'SUCCESS'
       GROUP BY campaign_id
     ) ps ON ps.campaign_id = c.id
     WHERE p.donateur_id = $1 AND p.status = 'SUCCESS'
     GROUP BY c.id, u.name, u.email, ps.amount_raised, ps.backer_count
     ORDER BY last_supported_at DESC`,
    [donorId]
  );

  return rows;
};
