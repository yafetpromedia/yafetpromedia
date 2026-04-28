import { query } from "@db";
import { readTestimonialSubmissionsFromFile } from "./testimonial-submissions-file";

export type ApprovedTestimonialPublic = {
  quote: string;
  author: string;
  role: string;
  rating: number;
};

function clampRating(n: number): number {
  const r = Math.round(Number(n));
  if (Number.isNaN(r)) return 5;
  return Math.min(5, Math.max(1, r));
}

export async function getApprovedTestimonialsForPublic(limit = 12): Promise<ApprovedTestimonialPublic[]> {
  type DbRow = {
    quote: string;
    author: string;
    role: string;
    rating: number;
    approved_at: string | null;
  };

  const fromDb = await query<DbRow>(
    `
      SELECT quote, author, role, rating, approved_at
      FROM testimonial_submissions
      WHERE status = 'approved'
      ORDER BY approved_at DESC NULLS LAST, id DESC
      LIMIT $1
    `,
    [limit]
  ).catch(() => []);

  const fileRows = await readTestimonialSubmissionsFromFile();
  const fromFile = fileRows
    .filter((r) => r.status === "approved")
    .map((r) => ({
      quote: r.quote,
      author: r.author,
      role: r.role,
      rating: clampRating(r.rating),
      sort: r.approved_at ? new Date(r.approved_at).getTime() : 0,
    }));

  const merged = [
    ...fromDb.map((r) => ({
      quote: r.quote,
      author: r.author,
      role: r.role,
      rating: clampRating(r.rating),
      sort: r.approved_at ? new Date(r.approved_at).getTime() : 0,
    })),
    ...fromFile,
  ];

  merged.sort((a, b) => b.sort - a.sort);

  return merged.slice(0, limit).map(({ quote, author, role, rating }) => ({
    quote,
    author,
    role,
    rating,
  }));
}
