import { appendLeadToFile } from "@backend/leads-file";
import { query } from "@db";
import nodemailer from "nodemailer";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/request-security";

export const runtime = "nodejs";

async function sendLeadNotificationEmail(lead: {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;
  const to = process.env.LEADS_NOTIFY_TO ?? process.env.ADMIN_EMAIL;

  if (!host || !user || !pass || !from || !to) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `New lead from ${lead.name} (${lead.company})`;
  const text = [
    "A new contact message was submitted.",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company}`,
    lead.phone ? `Phone: ${lead.phone}` : "",
    "",
    "Message:",
    lead.message,
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from,
    to,
    replyTo: lead.email,
    subject,
    text,
  });
}

export async function POST(request: Request) {
  try {
    const csrf = csrfGuard(request);
    if (csrf) return csrf;

    const ip = clientIpFromRequest(request);
    const limiter = hitRateLimit(`public:leads:${ip}`, { limit: 6, windowMs: 60_000 });
    if (!limiter.ok) {
      return Response.json(
        { error: "Too many submissions. Please wait and try again." },
        { status: 429, headers: { "Retry-After": String(limiter.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      company?: string;
      phone?: string;
      message?: string;
      website?: string;
    };

    const website = String(body.website ?? "").trim();
    // Honeypot: bots often fill hidden "website" field; accept silently without persisting.
    if (website.length > 0) {
      return Response.json({ ok: true });
    }

    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const company = String(body.company ?? "").trim().slice(0, 160);
    const phone = String(body.phone ?? "").trim().slice(0, 80);
    const message = String(body.message ?? "").trim().slice(0, 4000);

    if (!name || !email || !company || !phone || !message) {
      return Response.json(
        { error: "Name, email, company, phone, and message are required." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please provide a valid email." }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL?.trim();
    if (!dbUrl) {
      await appendLeadToFile({ name, email, company, phone, message });
    } else {
      try {
        await query(
          "INSERT INTO leads (name, email, company, phone, message) VALUES ($1, $2, $3, $4, $5)",
          [name, email, company, phone, message]
        );
      } catch (dbErr) {
        console.error("[leads] database insert failed, using file fallback:", dbErr);
        await appendLeadToFile({ name, email, company, phone, message });
      }
    }

    sendLeadNotificationEmail({ name, email, company, phone, message }).catch(() => {
      // Lead is already saved in DB; notification failure should not fail the form submit.
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[leads] submit failed:", err);
    return Response.json({ error: "Could not save lead." }, { status: 500 });
  }
}
