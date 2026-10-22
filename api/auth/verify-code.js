// POST /api/auth/verify-code  { email, code }
// Validates the code, creates a session, returns { token, email }.

const { neon } = require("@neondatabase/serverless");
const crypto = require("crypto");

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email: rawEmail, code } = req.body || {};
  if (!rawEmail || !code)
    return res.status(400).json({ error: "email and code required" });

  const email = rawEmail.trim().toLowerCase();

  const rows = await sql`
    SELECT code, expires_at FROM auth_codes WHERE email = ${email}
  `;

  if (!rows.length)
    return res.status(401).json({ error: "Invalid or expired code" });

  const { code: stored, expires_at } = rows[0];

  if (new Date(expires_at) < new Date()) {
    await sql`DELETE FROM auth_codes WHERE email = ${email}`;
    return res.status(401).json({ error: "Code expired — request a new one" });
  }

  if (stored !== String(code).trim())
    return res.status(401).json({ error: "Incorrect code" });

  // Ensure the account row exists (first sign-in)
  await sql`
    INSERT INTO account_sync (email, entries, settings, synced_at)
    VALUES (${email}, '{}', NULL, NOW())
    ON CONFLICT (email) DO NOTHING
  `;

  const token = crypto.randomBytes(32).toString("hex");
  await sql`
    INSERT INTO sessions (token, email, created_at)
    VALUES (${token}, ${email}, NOW())
  `;

  await sql`DELETE FROM auth_codes WHERE email = ${email}`;

  res.json({ ok: true, token, email });
};
