import { appendLeadToFile } from "@backend/leads-file";
import { query } from "@db";
import { sendLeadNotificationEmail } from "@/lib/lead-notify-mail";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/request-security";
import { sendVisitorThanksEmail } from "@/lib/visitor-thanks-mail";

export const runtime = "nodejs";

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
      inquiryType?: unknown;
      /** Rejected — recipients are server-resolved only. */
      to?: unknown;
      notifyTo?: unknown;
      recipient?: unknown;
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
    const inquiryType = body.inquiryType;

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

    // Persistence already succeeded — SMTP must not flip this into HTTP 500.
    // Response does not claim email delivery; only that the lead was accepted.
    void sendLeadNotificationEmail({
      name,
      email,
      company,
      phone,
      message,
      inquiryType,
    }).catch((err) => {
      console.error(
        "[leads] unexpected notify error after persist:",
        err instanceof Error ? err.message : "unknown"
      );
    });

    void sendVisitorThanksEmail({ kind: "contact", name, email }).catch((err) => {
      console.error(
        "[leads] unexpected visitor thanks error after persist:",
        err instanceof Error ? err.message : "unknown"
      );
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[leads] submit failed:", err);
    return Response.json({ error: "Could not save lead." }, { status: 500 });
  }
}
