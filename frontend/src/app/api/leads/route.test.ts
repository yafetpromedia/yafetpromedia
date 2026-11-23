import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const appendLeadToFile = vi.fn();
const query = vi.fn();
const sendLeadNotificationEmail = vi.fn();

vi.mock("@backend/leads-file", () => ({
  appendLeadToFile: (...args: unknown[]) => appendLeadToFile(...args),
}));

vi.mock("@db", () => ({
  query: (...args: unknown[]) => query(...args),
}));

vi.mock("@/lib/lead-notify-mail", () => ({
  sendLeadNotificationEmail: (...args: unknown[]) => sendLeadNotificationEmail(...args),
}));

import { POST } from "./route";
import { resetRateLimitBucketsForTests } from "@/lib/rate-limit";

function makeRequest(body: unknown, init?: { origin?: string; ip?: string }) {
  return new Request("https://awuddigitals.com/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "awuddigitals.com",
      Origin: init?.origin ?? "https://awuddigitals.com",
      "x-forwarded-for": init?.ip ?? `203.0.113.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  phone: "+251900000000",
  message: "We need a new website.",
  website: "",
};

describe("POST /api/leads", () => {
  beforeEach(() => {
    resetRateLimitBucketsForTests();
    appendLeadToFile.mockReset().mockResolvedValue({ id: -1 });
    query.mockReset();
    sendLeadNotificationEmail.mockReset().mockResolvedValue({
      delivered: true,
      to: "contact@awuddigitals.com",
      inquiryType: "contact",
    });
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts the existing form payload without inquiryType", async () => {
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(appendLeadToFile).toHaveBeenCalledWith({
      name: validPayload.name,
      email: validPayload.email,
      company: validPayload.company,
      phone: validPayload.phone,
      message: validPayload.message,
    });
    expect(sendLeadNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: validPayload.email,
        inquiryType: undefined,
      })
    );
  });

  it("passes through each valid inquiryType without storing it in persistence", async () => {
    for (const inquiryType of ["contact", "info", "sales", "support"] as const) {
      appendLeadToFile.mockClear();
      sendLeadNotificationEmail.mockClear();
      const res = await POST(makeRequest({ ...validPayload, inquiryType }));
      expect(res.status).toBe(200);
      expect(appendLeadToFile.mock.calls[0][0]).not.toHaveProperty("inquiryType");
      expect(sendLeadNotificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ inquiryType })
      );
    }
  });

  it("ignores client-supplied recipient fields", async () => {
    await POST(
      makeRequest({
        ...validPayload,
        inquiryType: "sales",
        to: "hacked@evil.com",
        notifyTo: "hacked@evil.com",
        recipient: "hacked@evil.com",
      })
    );
    expect(sendLeadNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        inquiryType: "sales",
        email: validPayload.email,
      })
    );
    const arg = sendLeadNotificationEmail.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.to).toBeUndefined();
    expect(arg.notifyTo).toBeUndefined();
    expect(arg.recipient).toBeUndefined();
  });

  it("returns ok after persist even when SMTP notify fails", async () => {
    sendLeadNotificationEmail.mockRejectedValue(new Error("smtp down"));
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(appendLeadToFile).toHaveBeenCalled();
  });

  it("rejects cross-origin CSRF failures", async () => {
    const res = await POST(
      makeRequest(validPayload, { origin: "https://evil.example" })
    );
    expect(res.status).toBe(403);
    expect(appendLeadToFile).not.toHaveBeenCalled();
    expect(sendLeadNotificationEmail).not.toHaveBeenCalled();
  });

  it("honeypot website field skips persistence and notify", async () => {
    const res = await POST(makeRequest({ ...validPayload, website: "http://spam.test" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(appendLeadToFile).not.toHaveBeenCalled();
    expect(sendLeadNotificationEmail).not.toHaveBeenCalled();
  });

  it("rate-limits repeated submissions from the same IP", async () => {
    const ip = "198.51.100.42";
    for (let i = 0; i < 6; i += 1) {
      const res = await POST(makeRequest(validPayload, { ip }));
      expect(res.status).toBe(200);
    }
    const blocked = await POST(makeRequest(validPayload, { ip }));
    expect(blocked.status).toBe(429);
  });

  it("persists via database when DATABASE_URL is set", async () => {
    process.env.DATABASE_URL = "postgresql://example/db";
    query.mockResolvedValue([]);
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    expect(query).toHaveBeenCalled();
    expect(appendLeadToFile).not.toHaveBeenCalled();
    delete process.env.DATABASE_URL;
  });
});
