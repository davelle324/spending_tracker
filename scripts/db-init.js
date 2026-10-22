// One-time schema setup. Run: npm run db:init
// Uses DATABASE_URL_UNPOOLED (direct connection) as required for DDL.

const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED not set — run `neon deploy` first.");
  process.exit(1);
}

const sql = neon(url);

async function init() {
  console.log("Creating device_sync…");
  await sql`
    CREATE TABLE IF NOT EXISTS device_sync (
      device_id  TEXT        PRIMARY KEY,
      entries    JSONB       NOT NULL DEFAULT '{}',
      settings   JSONB,
      synced_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("Creating account_sync…");
  await sql`
    CREATE TABLE IF NOT EXISTS account_sync (
      email      TEXT        PRIMARY KEY,
      entries    JSONB       NOT NULL DEFAULT '{}',
      settings   JSONB,
      synced_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("Creating auth_codes…");
  await sql`
    CREATE TABLE IF NOT EXISTS auth_codes (
      email      TEXT        PRIMARY KEY,
      code       TEXT        NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;

  console.log("Creating sessions…");
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT        PRIMARY KEY,
      email      TEXT        NOT NULL REFERENCES account_sync(email) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("All tables ready.");
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
