import { query } from "@/database";
import nodemailer from "nodemailer";

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
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      company?: string;
      phone?: string;
      message?: string;
    };

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

    await query(
      "INSERT INTO leads (name, email, company, phone, message) VALUES ($1, $2, $3, $4, $5)",
      [name, email, company, phone, message]
    );
    sendLeadNotificationEmail({ name, email, company, phone, message }).catch(() => {
      // Lead is already saved in DB; notification failure should not fail the form submit.
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not save lead." }, { status: 500 });
  }
}
