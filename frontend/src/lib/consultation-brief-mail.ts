import nodemailer from "nodemailer";
import { buildClientBriefEmailContent } from "@/lib/project-brief-document";
import { resolveLeadNotifyTo } from "@/lib/lead-notify-mail";
import type { ProjectBrief } from "@/lib/project-consultant.shared";

type EnvLike = Record<string, string | undefined>;

export type ClientBriefMailResult =
  | { delivered: true }
  | { delivered: false; reason: "missing_config" | "invalid_email" | "send_failed" };

function missingSmtpKeys(env: EnvLike): string[] {
  const missing: string[] = [];
  if (!env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
  if (!env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
  if (!(env.SMTP_FROM?.trim() || env.SMTP_USER?.trim())) missing.push("SMTP_FROM");
  return missing;
}

function formatFrom(fromRaw: string): string {
  const trimmed = fromRaw.trim();
  if (trimmed.includes("<") && trimmed.includes(">")) return trimmed;
  return `Awud Digitals <${trimmed}>`;
}

/**
 * Emails the visitor a branded project brief. Failures are logged; they must not
 * roll back consultation / lead persistence.
 */
export async function sendClientProjectBriefEmail(input: {
  clientName: string;
  clientEmail: string;
  brief: ProjectBrief;
  env?: EnvLike;
}): Promise<ClientBriefMailResult> {
  const env = input.env ?? process.env;
  const to = input.clientEmail.trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { delivered: false, reason: "invalid_email" };
  }

  const missing = missingSmtpKeys(env);
  if (missing.length > 0) {
    console.warn(
      `[consultation-mail] SMTP not configured; skipping client brief email. missing=${missing.join(",")}`
    );
    return { delivered: false, reason: "missing_config" };
  }

  const host = env.SMTP_HOST!.trim();
  const port = Number(env.SMTP_PORT ?? "465");
  const user = env.SMTP_USER!.trim();
  const pass = env.SMTP_PASS!;
  const from = formatFrom(env.SMTP_FROM?.trim() || user);
  const replyTo = resolveLeadNotifyTo("sales", env);
  const content = buildClientBriefEmailContent({
    clientName: input.clientName,
    brief: input.brief,
    env,
  });

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from,
      to,
      replyTo,
      subject: content.subject.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").trim().slice(0, 180),
      text: content.text,
      html: content.html,
    });
    return { delivered: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    console.error(
      `[consultation-mail] client brief email failed host=${host} port=${port} error=${message}`
    );
    return { delivered: false, reason: "send_failed" };
  }
}
