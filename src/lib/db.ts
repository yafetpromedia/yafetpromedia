import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { defaultSiteContent } from "@/lib/site-content.shared";

type DatabaseInstance = Database.Database;

let db: DatabaseInstance | null = null;

function hashPassword(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function ensureSchema(database: DatabaseInstance) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_headline TEXT NOT NULL,
      hero_highlight TEXT NOT NULL,
      hero_tail TEXT NOT NULL,
      hero_badge TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      ai_name TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_message TEXT NOT NULL,
      ai_reply TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedInitialData(database: DatabaseInstance) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@yafetpromedia.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? hashPassword(adminPassword);

  const existingUser = database
    .prepare("SELECT id FROM admin_users WHERE email = ? LIMIT 1")
    .get(adminEmail) as { id: number } | undefined;

  if (!existingUser) {
    database
      .prepare("INSERT INTO admin_users (email, password_hash) VALUES (?, ?)")
      .run(adminEmail, passwordHash);
  }

  const existingContent = database
    .prepare("SELECT id FROM site_content WHERE id = 1")
    .get() as { id: number } | undefined;

  if (!existingContent) {
    database
      .prepare(
        `
        INSERT INTO site_content (
          id, hero_headline, hero_highlight, hero_tail, hero_badge,
          contact_email, contact_phone, ai_name, whatsapp_number
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        defaultSiteContent.heroHeadline,
        defaultSiteContent.heroHighlight,
        defaultSiteContent.heroTail,
        defaultSiteContent.heroBadge,
        defaultSiteContent.contactEmail,
        defaultSiteContent.contactPhone,
        defaultSiteContent.aiName,
        defaultSiteContent.whatsappNumber
      );
  }
}

export function getDb() {
  if (db) return db;

  const dbFile = path.join(process.cwd(), "data", "app.db");
  mkdirSync(path.dirname(dbFile), { recursive: true });
  const database = new Database(dbFile);
  ensureSchema(database);
  seedInitialData(database);
  db = database;
  return db;
}

export function hashAdminPassword(input: string) {
  return hashPassword(input);
}
