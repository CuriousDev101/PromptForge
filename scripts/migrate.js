#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import dotenv from "dotenv";
import { neon, neonConfig } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

// Ensure IPv4 routing for environments with unroutable IPv6
neonConfig.fetchFunction = (url, init) => {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const agent = new https.Agent({ family: 4, keepAlive: false });
    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: init?.method || "GET",
        headers: init?.headers,
        agent: agent,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: new Headers(res.headers),
            json: async () => JSON.parse(body),
            text: async () => body,
          });
        });
      }
    );
    req.on("error", reject);
    if (init?.body) req.write(init.body);
    req.end();
  });
};

const sql = neon(databaseUrl);

async function runMigrations() {
  const drizzleDir = path.resolve(process.cwd(), "drizzle");
  if (!fs.existsSync(drizzleDir)) {
    console.log("No drizzle directory found.");
    return;
  }

  const entries = fs.readdirSync(drizzleDir, { withFileTypes: true });
  const migrationDirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  console.log(`Found ${migrationDirs.length} migration folders.`);

  for (const dir of migrationDirs) {
    const sqlPath = path.join(drizzleDir, dir, "migration.sql");
    if (fs.existsSync(sqlPath)) {
      console.log(`Applying migration ${dir}...`);
      const content = fs.readFileSync(sqlPath, "utf8");
      const statements = content
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);

      for (let i = 0; i < statements.length; i++) {
        await sql.query(statements[i]);
      }
      console.log(`✓ Migration ${dir} applied successfully.`);
    }
  }

  const tables = await sql.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  console.log("Database tables:", tables.map((t) => t.table_name));
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
