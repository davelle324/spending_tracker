// GET  /api/account-sync  → returns shared account data
// POST /api/account-sync  → upserts shared account data
// Both require Authorization: Bearer <token>

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function emailFromToken(token) {
  const rows = await sql`
    SELECT email FROM sessions WHERE token = ${token}
  `;
  return rows.length ? rows[0].email : null;
}

module.exports = async function handler(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const email = await emailFromToken(token);
  if (!email) return res.status(401).json({ error: "Invalid or expired session" });

  if (req.method === "GET") {
    const rows = await sql`
      SELECT entries, settings, synced_at
      FROM account_sync
      WHERE email = ${email}
    `;
    if (!rows.length) return res.json({ exists: false });
    return res.json({ exists: true, ...rows[0] });
  }

  if (req.method === "POST") {
    const { entries = {}, settings = null } = req.body || {};
    await sql`
      INSERT INTO account_sync (email, entries, settings, synced_at)
      VALUES (
        ${email},
        ${JSON.stringify(entries)},
        ${settings !== null ? JSON.stringify(settings) : null},
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        entries   = EXCLUDED.entries,
        settings  = EXCLUDED.settings,
        synced_at = NOW()
    `;
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
};
