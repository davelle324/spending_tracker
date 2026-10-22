// Vercel serverless function — syncs app data to Neon Postgres.
// GET  /api/sync?device_id=<id>  → returns stored entries + settings
// POST /api/sync?device_id=<id>  → upserts entries + settings
// Uses DATABASE_URL (pooled) from .env.local / Vercel environment.

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS device_sync (
      device_id  TEXT        PRIMARY KEY,
      entries    JSONB       NOT NULL DEFAULT '{}',
      settings   JSONB,
      synced_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

module.exports = async function handler(req, res) {
  const device_id = req.query.device_id;
  if (!device_id || typeof device_id !== "string") {
    return res.status(400).json({ error: "device_id query param required" });
  }

  try {
    await ensureTable();

    if (req.method === "GET") {
      const rows = await sql`
        SELECT entries, settings, synced_at
        FROM device_sync
        WHERE device_id = ${device_id}
      `;
      if (!rows.length) return res.json({ exists: false });
      return res.json({ exists: true, ...rows[0] });
    }

    if (req.method === "POST") {
      const { entries = {}, settings = null } = req.body || {};
      await sql`
        INSERT INTO device_sync (device_id, entries, settings, synced_at)
        VALUES (
          ${device_id},
          ${JSON.stringify(entries)},
          ${settings !== null ? JSON.stringify(settings) : null},
          NOW()
        )
        ON CONFLICT (device_id) DO UPDATE SET
          entries   = EXCLUDED.entries,
          settings  = EXCLUDED.settings,
          synced_at = NOW()
      `;
      return res.json({ ok: true });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("sync error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
