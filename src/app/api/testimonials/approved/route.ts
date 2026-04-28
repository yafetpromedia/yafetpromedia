import { getApprovedTestimonialsForPublic } from "@/server/testimonials-approved";

export const runtime = "nodejs";

export async function GET() {
  try {
    const testimonials = await getApprovedTestimonialsForPublic(12);
    return Response.json({ testimonials });
  } catch {
    return Response.json({ testimonials: [] as const });
  }
}
