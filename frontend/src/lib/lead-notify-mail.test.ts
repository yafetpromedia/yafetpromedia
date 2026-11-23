import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildLeadNotificationContent,
  normalizeInquiryType,
  resolveLeadNotifyTo,
  sanitizeEmailHeaderValue,
  sendLeadNotificationEmail,
} from "./lead-notify-mail";

const baseLead = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  phone: "+251900000000",
  message: "We need a new website.",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("normalizeInquiryType", () => {
  it("defaults missing inquiryType to contact", () => {
    expect(normalizeInquiryType(undefined)).toBe("contact");
    expect(normalizeInquiryType(null)).toBe("contact");
    expect(normalizeInquiryType("")).toBe("contact");
  });

  it("accepts the four valid types", () => {
    expect(normalizeInquiryType("contact")).toBe("contact");
    expect(normalizeInquiryType("info")).toBe("info");
    expect(normalizeInquiryType("sales")).toBe("sales");
    expect(normalizeInquiryType("support")).toBe("support");
    expect(normalizeInquiryType("SALES")).toBe("sales");
  });

  it("falls back to contact for invalid values", () => {
    expect(normalizeInquiryType("billing")).toBe("contact");
    expect(normalizeInquiryType("attacker@evil.com")).toBe("contact");
  });
});

describe("resolveLeadNotifyTo", () => {
  it("uses defaults for each inquiry type", () => {
    expect(resolveLeadNotifyTo("contact", {})).toBe("contact@awuddigitals.com");
    expect(resolveLeadNotifyTo("info", {})).toBe("info@awuddigitals.com");
    expect(resolveLeadNotifyTo("sales", {})).toBe("sales@awuddigitals.com");
    expect(resolveLeadNotifyTo("support", {})).toBe("support@awuddigitals.com");
  });

  it("uses typed env overrides and LEADS_NOTIFY_TO legacy for contact", () => {
    expect(
      resolveLeadNotifyTo("contact", {
        LEADS_NOTIFY_CONTACT_TO: "team-contact@awuddigitals.com",
      })
    ).toBe("team-contact@awuddigitals.com");
    expect(
      resolveLeadNotifyTo("contact", {
        LEADS_NOTIFY_TO: "legacy@awuddigitals.com",
      })
    ).toBe("legacy@awuddigitals.com");
    expect(
      resolveLeadNotifyTo("sales", {
        LEADS_NOTIFY_SALES_TO: "pipeline@awuddigitals.com",
        LEADS_NOTIFY_TO: "legacy@awuddigitals.com",
      })
    ).toBe("pipeline@awuddigitals.com");
  });

  it("never uses a client-supplied recipient key from env-like maps", () => {
    // Only server env keys are read; arbitrary "to" is ignored.
    const env = {
      to: "hacked@evil.com",
      notifyTo: "hacked@evil.com",
      recipient: "hacked@evil.com",
    };
    expect(resolveLeadNotifyTo("contact", env)).toBe("contact@awuddigitals.com");
  });
});

describe("sanitizeEmailHeaderValue / subject injection", () => {
  it("removes CR/LF and other control characters", () => {
    expect(sanitizeEmailHeaderValue("Ada\r\nBcc: evil@x.com")).toBe("Ada Bcc: evil@x.com");
    expect(sanitizeEmailHeaderValue("A\u0000B\u001FC")).toBe("A B C");
  });

  it("keeps subject as a single line and blocks CRLF header injection", () => {
    const poisonedName = "Ada\r\nBcc: attacker@evil.com\r\nX-Injected: yes";
    const poisonedCompany = "Corp\nCc: leaked@evil.com";
    const content = buildLeadNotificationContent({
      ...baseLead,
      name: poisonedName,
      company: poisonedCompany,
      inquiryType: "contact",
    });

    expect(content.subject).not.toMatch(/[\r\n]/);
    expect(content.subject.split(/\r?\n/)).toHaveLength(1);
    expect(content.subject).toBe(
      "[General contact] New inquiry from Ada Bcc: attacker@evil.com X-Injected: yes (Corp Cc: leaked@evil.com)"
    );
    // Injected header names must not form new header lines (no CRLF before them).
    expect(content.subject).not.toMatch(/\nBcc:/i);
    expect(content.subject).not.toMatch(/\rBcc:/i);
    expect(content.subject).not.toMatch(/\nCc:/i);

    // Body / stored-facing content still uses original values (route persistence unchanged).
    expect(content.text).toContain(poisonedName);
    expect(content.text).toContain(poisonedCompany);
    expect(content.html).toContain("Ada");
  });

  it("includes inquiry label and escapes HTML in the HTML body", () => {
    const content = buildLeadNotificationContent({
      ...baseLead,
      name: "Ada <script>alert(1)</script>",
      inquiryType: "sales",
    });
    expect(content.subject).toContain("Sales inquiry");
    expect(content.subject).not.toMatch(/[\r\n]/);
    expect(content.text).toContain("ada@example.com");
    expect(content.html).toContain("Sales inquiry");
    expect(content.html).not.toContain("<script>");
    expect(content.html).toContain("&lt;script&gt;");
  });
});

describe("sendLeadNotificationEmail", () => {
  it("preserves visitor Reply-To and routes by inquiry type", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    const result = await sendLeadNotificationEmail(
      { ...baseLead, inquiryType: "support" },
      {
        env: {
          SMTP_HOST: "mx1.aletcloud.com",
          SMTP_PORT: "465",
          SMTP_USER: "contact@awuddigitals.com",
          SMTP_PASS: "redacted-for-test",
          SMTP_FROM: "contact@awuddigitals.com",
        },
        sendMail,
      }
    );

    expect(result).toEqual({
      delivered: true,
      to: "support@awuddigitals.com",
      inquiryType: "support",
    });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const arg = sendMail.mock.calls[0][0];
    expect(arg.replyTo).toBe("ada@example.com");
    expect(arg.to).toBe("support@awuddigitals.com");
    expect(arg.from).toContain("Awud Digitals");
    expect(arg.from).toContain("contact@awuddigitals.com");
    expect(arg.html).toBeTruthy();
    expect(arg.text).toBeTruthy();
  });

  it("defaults missing inquiryType to contact destination", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    const result = await sendLeadNotificationEmail(baseLead, {
      env: {
        SMTP_HOST: "mx1.aletcloud.com",
        SMTP_PORT: "465",
        SMTP_USER: "contact@awuddigitals.com",
        SMTP_PASS: "redacted-for-test",
        SMTP_FROM: "contact@awuddigitals.com",
        LEADS_NOTIFY_TO: "contact@awuddigitals.com",
      },
      sendMail,
    });
    expect(result.delivered).toBe(true);
    if (result.delivered) {
      expect(result.to).toBe("contact@awuddigitals.com");
      expect(result.inquiryType).toBe("contact");
    }
    expect(sendMail.mock.calls[0][0].to).toBe("contact@awuddigitals.com");
  });

  it("invalid inquiryType falls back to contact", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    await sendLeadNotificationEmail(
      { ...baseLead, inquiryType: "not-a-real-type" },
      {
        env: {
          SMTP_HOST: "mx1.aletcloud.com",
          SMTP_PORT: "465",
          SMTP_USER: "contact@awuddigitals.com",
          SMTP_PASS: "redacted-for-test",
          SMTP_FROM: "contact@awuddigitals.com",
        },
        sendMail,
      }
    );
    expect(sendMail.mock.calls[0][0].to).toBe("contact@awuddigitals.com");
  });

  it("cannot inject an arbitrary recipient via payload fields", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    await sendLeadNotificationEmail(
      {
        ...baseLead,
        inquiryType: "sales",
        // @ts-expect-error intentional injection attempt
        to: "hacked@evil.com",
        notifyTo: "hacked@evil.com",
      },
      {
        env: {
          SMTP_HOST: "mx1.aletcloud.com",
          SMTP_PORT: "465",
          SMTP_USER: "contact@awuddigitals.com",
          SMTP_PASS: "redacted-for-test",
          SMTP_FROM: "contact@awuddigitals.com",
        },
        sendMail,
      }
    );
    expect(sendMail.mock.calls[0][0].to).toBe("sales@awuddigitals.com");
    expect(sendMail.mock.calls[0][0].to).not.toBe("hacked@evil.com");
  });

  it("logs and returns missing_config when SMTP env is incomplete", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sendMail = vi.fn();
    const result = await sendLeadNotificationEmail(baseLead, {
      env: { SMTP_HOST: "mx1.aletcloud.com" },
      sendMail,
    });
    expect(result).toEqual({
      delivered: false,
      reason: "missing_config",
      inquiryType: "contact",
    });
    expect(sendMail).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0][0])).toContain("SMTP not configured");
    expect(String(warn.mock.calls[0][0])).not.toContain("redacted");
  });

  it("logs send failure without treating it as delivered", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const sendMail = vi.fn().mockRejectedValue(Object.assign(new Error("conn reset"), { code: "ESOCKET" }));
    const result = await sendLeadNotificationEmail(baseLead, {
      env: {
        SMTP_HOST: "mx1.aletcloud.com",
        SMTP_PORT: "465",
        SMTP_USER: "contact@awuddigitals.com",
        SMTP_PASS: "redacted-for-test",
        SMTP_FROM: "contact@awuddigitals.com",
      },
      sendMail,
    });
    expect(result).toEqual({
      delivered: false,
      reason: "send_failed",
      inquiryType: "contact",
    });
    expect(error).toHaveBeenCalled();
    const logged = String(error.mock.calls[0][0]);
    expect(logged).toContain("SMTP delivery failed");
    expect(logged).toContain("ESOCKET");
    expect(logged).not.toContain("redacted-for-test");
    expect(logged).not.toContain(baseLead.message);
  });
});
