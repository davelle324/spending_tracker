// POST /api/auth/send-code  { email }
// Generates a 6-digit code, stores it in auth_codes (10-min TTL), sends via Resend.
// Falls back to console.log when RESEND_API_KEY is absent (dev / local).

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const raw = (req.body || {}).email;
  if (!raw || typeof raw !== "string" || !raw.includes("@"))
    return res.status(400).json({ error: "Valid email required" });

  const email = raw.trim().toLowerCase();
  const code = randomCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await sql`
    INSERT INTO auth_codes (email, code, expires_at)
    VALUES (${email}, ${code}, ${expires.toISOString()})
    ON CONFLICT (email) DO UPDATE
      SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at
  `;

  if (process.env.RESEND_API_KEY) {
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from =
      process.env.EMAIL_FROM || "Spending Tracker <onboarding@resend.dev>";
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: "Your Spending Tracker sign-in code",
      text: `Your sign-in code is: ${code}\n\nIt expires in 10 minutes. If you didn't request this, ignore this email.`,
    });
    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({ error: "Could not send email" });
    }
  } else {
    // dev fallback — code visible in Vercel function logs / local terminal
    console.log(`[dev] sign-in code for ${email}: ${code}`);
  }

  res.json({ ok: true });
};
