import nodemailer from "nodemailer";
import {
  resolveLeadNotifyTo,
  sanitizeEmailHeaderValue,
} from "@/lib/lead-notify-mail";
import { brandLogoUrl, publicSiteOrigin } from "@/lib/project-brief-document";

export type VisitorThanksKind = "contact" | "testimonial";

export type VisitorThanksResult =
  | { delivered: true; to: string; kind: VisitorThanksKind }
  | {
      delivered: false;
      reason: "missing_config" | "invalid_email" | "send_failed";
      kind: VisitorThanksKind;
    };

type EnvLike = Record<string, string | undefined>;

export type SendVisitorThanksDeps = {
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function missingSmtpKeys(env: EnvLike): string[] {
  const missing: string[] = [];
  if (!env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
  if (!env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
  if (!(env.SMTP_FROM?.trim() || env.SMTP_USER?.trim())) missing.push("SMTP_FROM");
  return missing;
}

function formatFromAddress(fromRaw: string): string {
  const trimmed = fromRaw.trim();
  if (trimmed.includes("<") && trimmed.includes(">")) return trimmed;
  return `Awud Digitals <${trimmed}>`;
}

function firstName(name: string): string {
  const part = name.trim().split(/\s+/)[0] ?? "";
  return part || "there";
}

type ThanksCopy = {
  subject: string;
  eyebrow: string;
  headline: string;
  statusLabel: string;
  body: string[];
  nextTitle: string;
  nextItems: string[];
  ctaLabel: string;
  ctaHref: string;
  textLines: string[];
};

function copyForKind(kind: VisitorThanksKind, greet: string, origin: string): ThanksCopy {
  if (kind === "testimonial") {
    return {
      subject: `Thanks for your testimonial — Awud Digitals`,
      eyebrow: "Story received",
      headline: "Your words just landed with us.",
      statusLabel: "In review",
      body: [
        `Hi ${greet} — thank you for sharing your experience with Awud Digitals.`,
        "Your testimonial is in our review queue. If we publish it, we may polish wording for clarity — never change what you meant.",
        "Grateful you took the time. Stories like yours help the next founder trust the work.",
      ],
      nextTitle: "What happens next",
      nextItems: [
        "Our team reads every submission",
        "Approved stories may appear on the site",
        "Reply anytime if you want an update",
      ],
      ctaLabel: "See the site",
      ctaHref: `${origin}/`,
      textLines: [
        `Hi ${greet},`,
        "",
        "Thank you for sharing your experience with Awud Digitals.",
        "Your testimonial is in review. If we publish it, we may polish wording for clarity — never change what you meant.",
        "",
        "What happens next:",
        "• Our team reads every submission",
        "• Approved stories may appear on the site",
        "• Reply anytime if you want an update",
        "",
        `— Awud Digitals`,
        origin,
      ],
    };
  }

  return {
    subject: `Thanks for reaching out — Awud Digitals`,
    eyebrow: "Message received",
    headline: "We’re on it.",
    statusLabel: "Queued for reply",
    body: [
      `Hi ${greet} — thanks for writing in.`,
      "Your message is with the Awud Digitals team. Someone will reply within one business day — usually sooner.",
      "No need to resend. If plans change, just reply to this email and we’ll pick it up.",
    ],
    nextTitle: "While you wait",
    nextItems: [
      "Keep an eye on your inbox (and spam, just in case)",
      "Explore products & recent work on the site",
      "Reply here anytime with more detail",
    ],
    ctaLabel: "Explore Awud Digitals",
    ctaHref: `${origin}/`,
    textLines: [
      `Hi ${greet},`,
      "",
      "Thanks for writing in to Awud Digitals.",
      "Your message is with our team. We’ll reply within one business day — usually sooner.",
      "",
      "While you wait:",
      "• Keep an eye on your inbox",
      `• Explore the site: ${origin}`,
      "• Reply here anytime with more detail",
      "",
      "— Awud Digitals",
    ],
  };
}

function buildModernThanksHtml(input: {
  logo: string;
  origin: string;
  copy: ThanksCopy;
}): string {
  const { logo, origin, copy } = input;
  const host = origin.replace(/^https?:\/\//, "");
  const bodyHtml = copy.body
    .map(
      (p, i) =>
        `<p style="margin:${i === 0 ? "0" : "14px"} 0 0;font-size:15px;line-height:1.65;color:#3a3a3a;">${escapeHtml(p)}</p>`
    )
    .join("");
  const nextRows = copy.nextItems
    .map(
      (item, i) => `<tr>
      <td style="padding:${i === 0 ? "0" : "10px"} 0 0;vertical-align:top;width:28px;">
        <span style="display:inline-block;width:18px;height:18px;border-radius:999px;background:#fff4ec;border:1px solid #ffd4b8;text-align:center;line-height:18px;font-size:11px;color:#e85d04;font-weight:700;">${i + 1}</span>
      </td>
      <td style="padding:${i === 0 ? "0" : "10px"} 0 0 10px;font-size:14px;line-height:1.5;color:#222;">${escapeHtml(item)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#eceae6;font-family:Segoe UI,Roboto,Helvetica Neue,Helvetica,Arial,sans-serif;color:#0c0c0c;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(copy.headline)} ${escapeHtml(copy.statusLabel)}.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceae6;padding:28px 12px 40px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-radius:24px;overflow:hidden;background:#ffffff;border:1px solid #e2dfd8;box-shadow:0 18px 50px rgba(12,12,12,0.08);">
        <!-- Hero -->
        <tr>
          <td style="background:#0c0c0c;padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="height:4px;background:#e85d04;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:28px 28px 8px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;">
                        <img src="${escapeHtml(logo)}" alt="Awud Digitals" width="44" height="44" style="display:block;border:0;border-radius:12px;" />
                      </td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#ff7d22;font-weight:600;">Awud Digitals</p>
                        <p style="margin:4px 0 0;font-size:12px;color:#8a8a8a;">${escapeHtml(copy.eyebrow)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 28px 28px;">
                  <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:650;color:#fafafa;letter-spacing:-0.02em;">${escapeHtml(copy.headline)}</h1>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                    <tr>
                      <td style="padding:7px 12px;border-radius:999px;background:rgba(232,93,4,0.16);border:1px solid rgba(232,93,4,0.35);">
                        <span style="display:inline-block;width:7px;height:7px;border-radius:999px;background:#e85d04;margin-right:8px;vertical-align:middle;"></span>
                        <span style="font-size:12px;font-weight:600;color:#ffb27a;letter-spacing:0.02em;vertical-align:middle;">${escapeHtml(copy.statusLabel)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 28px 8px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Next steps card -->
        <tr>
          <td style="padding:20px 28px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;background:#f7f6f3;border:1px solid #ebe7e0;">
              <tr>
                <td style="padding:18px 18px 6px;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8a857c;font-weight:600;">${escapeHtml(copy.nextTitle)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 18px 18px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${nextRows}</table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 28px 8px;">
            <a href="${escapeHtml(copy.ctaHref)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#0c0c0c;color:#ffffff;text-decoration:none;font-size:13px;font-weight:650;letter-spacing:0.02em;">${escapeHtml(copy.ctaLabel)} →</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 28px 28px;border-top:1px solid #efeae3;margin-top:12px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;line-height:1.55;color:#9a958c;">
                  Awud Digitals · software, products &amp; digital systems<br />
                  <a href="${escapeHtml(origin)}" style="color:#e85d04;text-decoration:none;font-weight:600;">${escapeHtml(host)}</a>
                  &nbsp;·&nbsp; Reply to this email anytime
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0;font-size:11px;color:#a39e94;text-align:center;">You’re getting this because you submitted a form on ${escapeHtml(host)}.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildVisitorThanksContent(input: {
  kind: VisitorThanksKind;
  name: string;
  env?: EnvLike;
}) {
  const env = input.env ?? process.env;
  const origin = publicSiteOrigin(env);
  const logo = brandLogoUrl(env);
  const greet = firstName(input.name);
  const safeName = sanitizeEmailHeaderValue(input.name || "friend", 80);
  const copy = copyForKind(input.kind, greet, origin);

  return {
    subject: copy.subject.slice(0, 180),
    text: copy.textLines.join("\n"),
    html: buildModernThanksHtml({ logo, origin, copy }),
    safeName,
  };
}

/**
 * Auto-reply to a visitor after contact or testimonial submit.
 * Failures are logged only — never undo persistence.
 */
export async function sendVisitorThanksEmail(
  input: { kind: VisitorThanksKind; name: string; email: string },
  deps: SendVisitorThanksDeps = {}
): Promise<VisitorThanksResult> {
  const env = deps.env ?? process.env;
  const kind = input.kind;
  const to = String(input.email ?? "").trim();

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { delivered: false, reason: "invalid_email", kind };
  }

  const missing = missingSmtpKeys(env);
  if (missing.length > 0) {
    console.warn(
      `[visitor-thanks] SMTP not configured; skipping auto-reply. missing=${missing.join(",")} kind=${kind}`
    );
    return { delivered: false, reason: "missing_config", kind };
  }

  const host = env.SMTP_HOST!.trim();
  const port = Number(env.SMTP_PORT ?? "465");
  const user = env.SMTP_USER!.trim();
  const pass = env.SMTP_PASS!;
  const from = formatFromAddress(env.SMTP_FROM?.trim() || user);
  const replyTo = resolveLeadNotifyTo("contact", env);
  const content = buildVisitorThanksContent({
    kind,
    name: input.name,
    env,
  });

  const mailOptions = {
    from,
    to,
    replyTo,
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
    return { delivered: true, to, kind };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    console.error(
      `[visitor-thanks] SMTP delivery failed kind=${kind} host=${host} port=${port} to=${to} error=${message}`
    );
    return { delivered: false, reason: "send_failed", kind };
  }
}
