# AletCloud Business Email (lead notifications)

Server-side SMTP for homepage contact / lead notifications. Credentials stay on the server — never in frontend code or Git.

## Required environment variables

Set these in the production process environment (or repo-root / `frontend` `.env.local` for local testing). **Do not commit real passwords.**

| Variable | Example / default | Purpose |
|----------|-------------------|---------|
| `SMTP_HOST` | `mx1.aletcloud.com` | AletCloud SMTP host |
| `SMTP_PORT` | `465` | SSL/TLS port (`secure` is enabled when port is `465`) |
| `SMTP_USER` | `contact@awuddigitals.com` | SMTP auth username |
| `SMTP_PASS` | *(mailbox password)* | SMTP auth password — server only |
| `SMTP_FROM` | `contact@awuddigitals.com` | Envelope/from address (shown as `Awud Digitals <…>`) |
| `LEADS_NOTIFY_TO` | `contact@awuddigitals.com` | Legacy fallback for **contact** destination |

## Inquiry routing destinations

Optional `inquiryType` on `POST /api/leads`: `contact` \| `info` \| `sales` \| `support`.  
Missing or invalid values → `contact`. Clients cannot supply an arbitrary recipient address.

| Variable | Default mailbox |
|----------|-----------------|
| `LEADS_NOTIFY_CONTACT_TO` | `contact@awuddigitals.com` (else `LEADS_NOTIFY_TO` / `ADMIN_EMAIL`) |
| `LEADS_NOTIFY_INFO_TO` | `info@awuddigitals.com` |
| `LEADS_NOTIFY_SALES_TO` | `sales@awuddigitals.com` |
| `LEADS_NOTIFY_SUPPORT_TO` | `support@awuddigitals.com` |

## Behavior notes

- Lead rows are saved even if SMTP fails; the API still returns `{ ok: true }` after a successful save (it does **not** claim mail was delivered).
- Visitor email is set as `Reply-To`.
- Homepage contact form does not send `inquiryType` yet; it uses the **contact** route by default.
- AI project consultant: when a visitor completes Plan with a valid email, the app emails them a branded HTML project brief and notifies `sales@` (via `inquiryType=sales`). Failures are logged and do not undo lead persistence.
- Optional `NEXT_PUBLIC_SITE_URL` / `SITE_URL` / `WEB_APP_URL` — absolute site origin for logo links in client brief emails (defaults to `https://awuddigitals.com`).

## Production checklist

1. Set SMTP + notify env vars on the VPS Node process that serves the Next app (port 3000).
2. Restart the Node process so it loads the new environment.
3. Submit a test lead and confirm delivery to `contact@awuddigitals.com` with correct Reply-To.
