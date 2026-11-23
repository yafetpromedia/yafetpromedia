import nodemailer from "nodemailer";

export const INQUIRY_TYPES = ["contact", "info", "sales", "support"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export type LeadNotifyPayload = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  inquiryType?: unknown;
};

export type LeadNotifyResult =
  | { delivered: true; to: string; inquiryType: InquiryType }
  | { delivered: false; reason: "missing_config" | "send_failed"; inquiryType: InquiryType };

const DEFAULT_DESTINATIONS: Record<InquiryType, string> = {
  contact: "contact@awuddigitals.com",
  info: "info@awuddigitals.com",
  sales: "sales@awuddigitals.com",
  support: "support@awuddigitals.com",
};

const INQUIRY_LABELS: Record<InquiryType, string> = {
  contact: "General contact",
  info: "General information",
  sales: "Sales inquiry",
  support: "Technical support",
};

type EnvLike = Record<string, string | undefined>;

export function normalizeInquiryType(raw: unknown): InquiryType {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();
  if ((INQUIRY_TYPES as readonly string[]).includes(value)) {
    return value as InquiryType;
  }
  return "contact";
}

/**
 * Resolves the internal notify mailbox. Never accepts a client-supplied recipient address.
 */
export function resolveLeadNotifyTo(
  inquiryType: InquiryType,
  env: EnvLike = process.env
): string {
  const typedKey =
    inquiryType === "contact"
      ? env.LEADS_NOTIFY_CONTACT_TO
      : inquiryType === "info"
        ? env.LEADS_NOTIFY_INFO_TO
        : inquiryType === "sales"
          ? env.LEADS_NOTIFY_SALES_TO
          : env.LEADS_NOTIFY_SUPPORT_TO;

  const fromTyped = typedKey?.trim();
  if (fromTyped) return fromTyped;

  if (inquiryType === "contact") {
    const legacy = env.LEADS_NOTIFY_TO?.trim() || env.ADMIN_EMAIL?.trim();
    if (legacy) return legacy;
  }

  return DEFAULT_DESTINATIONS[inquiryType];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Strip characters that must not appear in email header values (CR/LF and other C0/C1 controls).
 * Used for Subject only — does not alter persisted lead fields or body content.
 */
export function sanitizeEmailHeaderValue(value: string, maxLen = 120): string {
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function formatFromAddress(fromRaw: string): string {
  const trimmed = fromRaw.trim();
  if (trimmed.includes("<") && trimmed.includes(">")) return trimmed;
  return `Awud Digitals <${trimmed}>`;
}

export function buildLeadNotificationContent(lead: {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  inquiryType: InquiryType;
}) {
  const label = INQUIRY_LABELS[lead.inquiryType];
  const safeName = sanitizeEmailHeaderValue(lead.name);
  const safeCompany = sanitizeEmailHeaderValue(lead.company);
  const subject = `[${label}] New inquiry from ${safeName} (${safeCompany})`.slice(0, 200);

  const text = [
    "Awud Digitals — new website inquiry",
    "",
    `Type: ${label}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company}`,
    lead.phone ? `Phone: ${lead.phone}` : "",
    "",
    "Message:",
    lead.message,
    "",
    "—",
    "Reply to this email to respond directly to the visitor.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e2da;">
        <tr><td style="padding:28px 28px 12px;background:#0c0c0c;color:#fafafa;">
          <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.7;">Awud Digitals</p>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;line-height:1.3;">${escapeHtml(label)}</h1>
        </td></tr>
        <tr><td style="padding:24px 28px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#444;">A visitor submitted an inquiry on awuddigitals.com.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;">
            <tr><td style="padding:6px 0;color:#888;width:96px;">Name</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(lead.name)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(lead.email)}" style="color:#0c0c0c;">${escapeHtml(lead.email)}</a></td></tr>
            <tr><td style="padding:6px 0;color:#888;">Company</td><td style="padding:6px 0;">${escapeHtml(lead.company)}</td></tr>
            ${
              lead.phone
                ? `<tr><td style="padding:6px 0;color:#888;">Phone</td><td style="padding:6px 0;">${escapeHtml(lead.phone)}</td></tr>`
                : ""
            }
          </table>
          <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f7f5f1;border:1px solid #ebe6df;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#888;">Message</p>
            <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(lead.message)}</p>
          </div>
          <p style="margin:20px 0 0;font-size:13px;color:#666;">Reply to this email to respond directly to the visitor.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

function missingSmtpKeys(env: EnvLike): string[] {
  const missing: string[] = [];
  if (!env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
  if (!env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
  const from = env.SMTP_FROM?.trim() || env.SMTP_USER?.trim();
  if (!from) missing.push("SMTP_FROM");
  return missing;
}

export type SendLeadMailDeps = {
  env?: EnvLike;
  sendMail?: (options: {
    from: string;
    to: string;
    replyTo: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<unknown>;
};

/**
 * Sends an internal lead notification. Does not throw for delivery problems —
 * callers should keep lead persistence independent of SMTP.
 */
export async function sendLeadNotificationEmail(
  lead: LeadNotifyPayload,
  deps: SendLeadMailDeps = {}
): Promise<LeadNotifyResult> {
  const env = deps.env ?? process.env;
  const inquiryType = normalizeInquiryType(lead.inquiryType);
  const to = resolveLeadNotifyTo(inquiryType, env);
  const missing = missingSmtpKeys(env);

  if (missing.length > 0) {
    console.warn(
      `[leads-mail] SMTP not configured; skipping notify. missing=${missing.join(",")} inquiryType=${inquiryType} to=${to}`
    );
    return { delivered: false, reason: "missing_config", inquiryType };
  }

  const host = env.SMTP_HOST!.trim();
  const port = Number(env.SMTP_PORT ?? "465");
  const user = env.SMTP_USER!.trim();
  const pass = env.SMTP_PASS!;
  const fromRaw = (env.SMTP_FROM?.trim() || user)!;
  const from = formatFromAddress(fromRaw);
  const content = buildLeadNotificationContent({
    name: lead.name,
    email: lead.email,
    company: lead.company,
    phone: lead.phone,
    message: lead.message,
    inquiryType,
  });

  const mailOptions = {
    from,
    to,
    replyTo: lead.email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  };

  try {
    if (deps.sendMail) {
      await deps.sendMail(mailOptions);
    } else {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transporter.sendMail(mailOptions);
    }
    return { delivered: true, to, inquiryType };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: unknown }).code ?? "")
        : "";
    console.error(
      `[leads-mail] SMTP delivery failed inquiryType=${inquiryType} host=${host} port=${port} to=${to} code=${code || "n/a"} error=${message}`
    );
    return { delivered: false, reason: "send_failed", inquiryType };
  }
}
