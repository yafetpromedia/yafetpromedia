This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project layout

This app uses a **Next.js App Router** split into three conceptual layers:

| Layer | Location | Role |
|--------|-----------|------|
| **Frontend (UI)** | `src/app/` (pages, layouts), `src/components/`, `src/sections/` | React components, marketing sections, admin screens. Client and server components as marked. |
| **Backend (server logic)** | `src/server/` | Auth/session helpers, CMS read/write (`site-content.ts`), testimonial file queue, approved-testimonial merge logic. Consumed by `src/app/api/**` and server-only imports. |
| **Database** | `src/database/` | PostgreSQL pool, schema bootstrap (`CREATE` / `ALTER`), seed row for `site_content` / `admin_users`. Requires `DATABASE_URL` in `.env.local`. |
| **Shared** | `src/lib/*.shared.ts`, `src/lib/utils.ts` | Types and defaults used by both UI and server (e.g. `site-content.shared.ts`). |

Legacy **stable import paths** `import … from "@/lib/db"` (and `auth`, `site-content`, testimonial helpers) still work; they re-export the new `src/database` and `src/server` modules.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
