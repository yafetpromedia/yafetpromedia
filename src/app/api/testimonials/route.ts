import { query } from "@/database";
import { appendTestimonialSubmissionToFile } from "@/server/testimonial-submissions-file";

export const runtime = "nodejs";

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clampRating(raw: unknown): number {
  const n = Math.round(Number(raw));
  if (Number.isNaN(n)) return 5;
  return Math.min(5, Math.max(1, n));
}

export async function POST(request: Request) {
  let body: {
    quote?: string;
    author?: string;
    role?: string;
    email?: string;
    rating?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const quote = String(body.quote ?? "").trim();
    const author = String(body.author ?? "").trim().slice(0, 120);
    const role = String(body.role ?? "").trim().slice(0, 160);
    const emailRaw = String(body.email ?? "").trim().slice(0, 160);
    const email = emailRaw === "" ? "" : emailRaw;
    const rating = clampRating(body.rating);

    if (quote.length < 12) {
      return Response.json(
        { error: "Please write a bit more in your testimonial (at least 12 characters)." },
        { status: 400 }
      );
    }
    if (quote.length > 2000) {
      return Response.json({ error: "Testimonial is too long." }, { status: 400 });
    }
    if (!author) {
      return Response.json({ error: "Name is required." }, { status: 400 });
    }
    if (email && !looksLikeEmail(email)) {
      return Response.json({ error: "Please enter a valid email, or leave it blank." }, { status: 400 });
    }

    const payload = { quote, author, role, email, rating };

    try {
      await query(
        "INSERT INTO testimonial_submissions (quote, author, role, email, rating) VALUES ($1, $2, $3, $4, $5)",
        [quote, author, role, email, rating]
      );
      return Response.json({ ok: true, stored: "database" as const });
    } catch (dbErr) {
      if (process.env.NODE_ENV === "development") {
        console.error("[testimonials] database insert failed, using file fallback:", dbErr);
      }
      await appendTestimonialSubmissionToFile(payload);
      return Response.json({ ok: true, stored: "file" as const });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[testimonials] save failed:", err);
    }
    return Response.json(
      { error: "Could not save your testimonial. Please try again in a moment." },
      { status: 500 }
    );
  }
}
