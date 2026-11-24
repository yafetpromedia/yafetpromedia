import {
  clientFacingBriefMarkdown,
  type ProjectBrief,
} from "@/lib/project-consultant.shared";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function publicSiteOrigin(env: Record<string, string | undefined> = process.env): string {
  const raw =
    env.NEXT_PUBLIC_SITE_URL?.trim() ||
    env.SITE_URL?.trim() ||
    env.WEB_APP_URL?.trim() ||
    "https://awuddigitals.com";
  return raw.replace(/\/$/, "");
}

export function brandLogoUrl(env?: Record<string, string | undefined>): string {
  return `${publicSiteOrigin(env)}/brand/awud-mark.png`;
}

/** Client-facing markdown for downloads (no internal sales notes). */
export function clientBriefMarkdown(brief: ProjectBrief): string {
  return clientFacingBriefMarkdown(brief);
}

export function buildClientBriefEmailContent(input: {
  clientName: string;
  brief: ProjectBrief;
  env?: Record<string, string | undefined>;
}) {
  const name = input.clientName.trim() || "there";
  const brief = input.brief;
  const logo = brandLogoUrl(input.env);
  const site = publicSiteOrigin(input.env);
  const features = brief.recommendedFeatures.map((f) => `• ${f}`).join("\n");

  const subject = `Your Awud Digitals project brief — ${brief.projectType || "Project"}`.slice(0, 180);

  const summary = brief.clientSummary?.trim();
  const text = [
    `Hi ${name},`,
    "",
    "Thank you for planning with Awud Digitals. Here is your personalized project brief — written so it’s easy to share with your team.",
    "",
    ...(summary ? [summary, ""] : []),
    `Project: ${brief.projectType}`,
    `Industry: ${brief.industry}`,
    `Scope: ${brief.products}`,
    `Payments: ${brief.payments.join(", ") || "—"}`,
    `Preferred timeline: ${brief.timeline}`,
    `Budget range: ${brief.budget}`,
    "",
    "What we’ll include:",
    features || "• Discovery workshop",
    "",
    `Estimated delivery: ${brief.estimatedTimeline}`,
    `Estimated investment: ${brief.estimatedCost}`,
    "",
    "Reply to this email if you would like to refine scope or book a consultation.",
    "",
    "— Awud Digitals",
    site,
  ].join("\n");

  const featureRows = brief.recommendedFeatures
    .map(
      (f) =>
        `<tr><td style="padding:8px 0;font-size:14px;color:#1a1a1a;">✓ ${escapeHtml(f)}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e7e2da;">
        <tr><td style="padding:28px 28px 20px;background:#0c0c0c;">
          <img src="${escapeHtml(logo)}" alt="Awud Digitals" width="40" height="40" style="display:block;border-radius:10px;" />
          <p style="margin:14px 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#ff7d22;">Awud Digitals</p>
          <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#fafafa;font-weight:600;">Your project brief</h1>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#444;">Hi ${escapeHtml(name)}, thanks for planning with us. Here is a clear summary written for you and your stakeholders.${brief.preliminary ? " This copy is marked preliminary until remaining details are confirmed." : ""}</p>
          ${
            summary
              ? `<p style="margin:0 0 20px;padding:14px 16px;border-radius:14px;background:#f7f5f1;border:1px solid #ebe6df;font-size:14px;line-height:1.6;color:#333;">${escapeHtml(summary)}</p>`
              : ""
          }
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.55;">
            <tr><td style="padding:6px 0;color:#888;width:130px;">Project</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(brief.projectType)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Industry</td><td style="padding:6px 0;">${escapeHtml(brief.industry)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Scope</td><td style="padding:6px 0;">${escapeHtml(brief.products)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Payments</td><td style="padding:6px 0;">${escapeHtml(brief.payments.join(", ") || "—")}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Timeline</td><td style="padding:6px 0;">${escapeHtml(brief.timeline)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Budget</td><td style="padding:6px 0;">${escapeHtml(brief.budget)}</td></tr>
          </table>
          <p style="margin:22px 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#888;">Recommended features</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${featureRows}</table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;">
            <tr>
              <td style="width:50%;padding-right:6px;">
                <div style="border-radius:14px;background:#f7f5f1;border:1px solid #ebe6df;padding:14px;">
                  <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Timeline</p>
                  <p style="margin:6px 0 0;font-size:15px;font-weight:600;">${escapeHtml(brief.estimatedTimeline)}</p>
                </div>
              </td>
              <td style="width:50%;padding-left:6px;">
                <div style="border-radius:14px;background:#f7f5f1;border:1px solid #ebe6df;padding:14px;">
                  <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Est. cost</p>
                  <p style="margin:6px 0 0;font-size:15px;font-weight:600;">${escapeHtml(brief.estimatedCost)}</p>
                </div>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#555;">Reply to this email to refine the brief or book a consultation. We typically respond within one business day.</p>
          <p style="margin:18px 0 0;"><a href="${escapeHtml(site)}/#contact" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#0c0c0c;color:#fff;text-decoration:none;font-size:13px;font-weight:600;">Book a consultation</a></p>
        </td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid #efeae3;font-size:12px;color:#999;">
          Awud Digitals · <a href="${escapeHtml(site)}" style="color:#ff6a00;text-decoration:none;">${escapeHtml(site.replace(/^https?:\/\//, ""))}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
