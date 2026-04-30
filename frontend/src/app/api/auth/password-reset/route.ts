import { resetAdminPasswordWithRecovery } from "@backend/auth";
import { readSiteContent } from "@backend/site-content";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/request-security";

export const runtime = "nodejs";

export async function GET() {
  const recoveryConfigured = Boolean(process.env.ADMIN_PASSWORD_RECOVERY_SECRET?.trim());
  let helpText = "";
  try {
    const content = await readSiteContent();
    helpText = content.loginPasswordResetHelp ?? "";
  } catch {
    helpText = "";
  }
  return Response.json({ recoveryConfigured, helpText });
}

export async function POST(request: Request) {
  try {
    const csrf = csrfGuard(request);
    if (csrf) return csrf;

    const ip = clientIpFromRequest(request);
    const limiter = hitRateLimit(`auth:password-reset:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!limiter.ok) {
      return Response.json(
        { error: "Too many reset attempts. Please wait and retry." },
        { status: 429, headers: { "Retry-After": String(limiter.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      recoverySecret?: string;
      newPassword?: string;
    };
    const email = String(body.email ?? "").trim();
    const recoverySecret = String(body.recoverySecret ?? "");
    const newPassword = String(body.newPassword ?? "");

    const result = await resetAdminPasswordWithRecovery(email, recoverySecret, newPassword);
    if ("error" in result) {
      const status =
        result.error.includes("not configured") ? 503 : result.error.includes("database") ? 500 : 400;
      return Response.json({ error: result.error }, { status });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Request failed." }, { status: 500 });
  }
}
