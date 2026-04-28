This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies at the repo root (`npm install`), then run the development server:

```bash
npm run dev
```

This runs Next.js with the **working directory set to `frontend/`** (via `scripts/run-in-frontend.mjs`), so `next.config.ts` and `public/` always resolve. You can still run from that folder directly: `cd frontend && npx next dev`.

Put **`.env.local` at the repository root** (same folder as `frontend/`, `backend/`, `db/`). If anything still misses env vars, copy it into `frontend/` as well.

If the app won’t start or you see a blank/old error page, **free port 3000**: Task Manager → end stray **Node.js** processes, or run `netstat -ano | findstr ":3000"` and end that PID, then run `npm run dev` again.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project layout

This app uses a **Next.js App Router** split into three conceptual layers:

| Layer | Location | Role |
|--------|-----------|------|
| **Frontend (UI)** | `frontend/src/app/`, `frontend/src/components/`, `frontend/src/sections/`, `frontend/public/` | Next.js App Router, React UI, API route handlers, admin. From repo root run `npm run dev` (uses `scripts/run-in-frontend.mjs`). |
| **Backend (server logic)** | `backend/` | Auth/session helpers, CMS read/write (`site-content.ts`), testimonial file queue, approved-testimonial merge. Imported as `@backend/…` from the frontend app. |
| **Database** | `db/` | PostgreSQL pool, schema bootstrap (`CREATE` / `ALTER`), seed row for `site_content` / `admin_users`. Requires `DATABASE_URL` in `.env.local`. Import as `@db`. |
| **Shared types** | `frontend/src/lib/*.shared.ts`, `frontend/src/lib/utils.ts` | Types and defaults used by both UI and server (e.g. `site-content.shared.ts`). |

Legacy **stable import paths** `import … from "@/lib/db"` (and `auth`, `site-content`, testimonial helpers) still work from the frontend package; they re-export `@db` and `@backend/*`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
