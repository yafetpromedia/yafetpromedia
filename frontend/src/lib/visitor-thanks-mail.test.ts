import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildVisitorThanksContent,
  sendVisitorThanksEmail,
} from "./visitor-thanks-mail";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildVisitorThanksContent", () => {
  it("builds a modern contact thank-you with brand mark and status", () => {
    const content = buildVisitorThanksContent({
      kind: "contact",
      name: "Yafet Tesfaye",
      env: { NEXT_PUBLIC_SITE_URL: "https://awuddigitals.com" },
    });
    expect(content.subject.toLowerCase()).toContain("thanks");
    expect(content.text).toContain("Hi Yafet");
    expect(content.html).toContain("/brand/awud-mark.png");
    expect(content.html).toContain("We’re on it");
    expect(content.html).toContain("Queued for reply");
    expect(content.html).toContain("#e85d04");
  });

  it("builds a modern testimonial thank-you", () => {
    const content = buildVisitorThanksContent({
      kind: "testimonial",
      name: "Ada",
      env: { SITE_URL: "https://awuddigitals.com" },
    });
    expect(content.subject.toLowerCase()).toContain("testimonial");
    expect(content.text).toContain("testimonial");
    expect(content.html).toContain("Hi Ada");
    expect(content.html).toContain("In review");
    expect(content.html).toContain("/brand/awud-mark.png");
  });
});

describe("sendVisitorThanksEmail", () => {
  it("skips when SMTP is missing", async () => {
    const result = await sendVisitorThanksEmail(
      { kind: "contact", name: "Ada", email: "ada@example.com" },
      { env: {} }
    );
    expect(result).toEqual({
      delivered: false,
      reason: "missing_config",
      kind: "contact",
    });
  });

  it("rejects invalid visitor email", async () => {
    const result = await sendVisitorThanksEmail(
      { kind: "testimonial", name: "Ada", email: "not-an-email" },
      {
        env: {
          SMTP_HOST: "mx1.aletcloud.com",
          SMTP_USER: "contact@awuddigitals.com",
          SMTP_PASS: "secret",
          SMTP_FROM: "contact@awuddigitals.com",
        },
      }
    );
    expect(result.delivered).toBe(false);
    if (!result.delivered) expect(result.reason).toBe("invalid_email");
  });

  it("sends via injected sendMail", async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const result = await sendVisitorThanksEmail(
      { kind: "contact", name: "Ada Lovelace", email: "ada@example.com" },
      {
        env: {
          SMTP_HOST: "mx1.aletcloud.com",
          SMTP_USER: "contact@awuddigitals.com",
          SMTP_PASS: "secret",
          SMTP_FROM: "contact@awuddigitals.com",
          NEXT_PUBLIC_SITE_URL: "https://awuddigitals.com",
        },
        sendMail,
      }
    );
    expect(result).toEqual({
      delivered: true,
      to: "ada@example.com",
      kind: "contact",
    });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const arg = sendMail.mock.calls[0]![0] as {
      to: string;
      subject: string;
      html: string;
    };
    expect(arg.to).toBe("ada@example.com");
    expect(arg.subject.toLowerCase()).toContain("thanks");
    expect(arg.html).toContain("awud-mark.png");
    expect(arg.html).toContain("Explore Awud Digitals");
  });
});
