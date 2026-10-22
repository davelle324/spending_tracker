// GET /api/auth/config
// Returns public runtime config the client needs to know about.
// GOOGLE_CLIENT_ID is a public value — safe to expose.

module.exports = function handler(req, res) {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  });
};
