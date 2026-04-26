import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      company?: string;
      message?: string;
    };

    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const company = String(body.company ?? "").trim().slice(0, 160);
    const message = String(body.message ?? "").trim().slice(0, 4000);

    if (!name || !email || !company || !message) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }

    getDb()
      .prepare("INSERT INTO leads (name, email, company, message) VALUES (?, ?, ?, ?)")
      .run(name, email, company, message);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not save lead." }, { status: 500 });
  }
}
