// POST /api/auth/sign-out  (Authorization: Bearer <token>)
// Deletes the session so the token stops working.

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token) return res.status(401).json({ error: "No token" });

  await sql`DELETE FROM sessions WHERE token = ${token}`;
  res.json({ ok: true });
};
