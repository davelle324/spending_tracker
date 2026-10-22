// POST /api/auth/google  { credential: <Google ID token> }
// Verifies the token, ensures an account_sync row exists, creates a session.
// Returns the same { ok, token, email } shape as verify-code.js.

const { neon } = require("@neondatabase/serverless");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId)
    return res.status(503).json({ error: "Google sign-in not configured" });

  const { credential } = req.body || {};
  if (!credential || typeof credential !== "string")
    return res.status(400).json({ error: "credential required" });

  let email;
  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    email = ticket.getPayload()?.email;
    if (!email) throw new Error("no email in token");
  } catch {
    return res.status(401).json({ error: "Invalid Google credential" });
  }

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

  res.json({ ok: true, token, email });
};
