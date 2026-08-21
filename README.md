# Developer Portfolio Analytics Dashboard

Production-oriented internship project based on the supplied project specification. It supports registration/login, portfolio builder, project CRUD, dynamic public portfolios, privacy-friendly analytics, analytics dashboard, and PDF report generation.

## Stack
- Frontend: Next.js 14, React, TypeScript, CSS
- Backend: Node.js, Express, TypeScript, Prisma
- Database: SQLite by default for zero-config local development; PostgreSQL-ready through `DATABASE_URL`
- Auth: JWT + bcrypt
- Validation: Zod
- Charts: Recharts
- Reports: PDFKit

## Run

### Backend
```bash
cd server
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```bash
cd client
npm install
copy .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment
Backend:
- DATABASE_URL
- JWT_SECRET
- CLIENT_URL
- PORT

Frontend:
- NEXT_PUBLIC_API_URL

For PostgreSQL, replace DATABASE_URL with a PostgreSQL connection string and run Prisma migration again.

## Main routes
- `/` landing page
- `/login`
- `/register`
- `/dashboard`
- `/dashboard/portfolio`
- `/dashboard/projects`
- `/dashboard/analytics`
- `/dashboard/reports`
- `/dashboard/settings`
- `/p/[slug]` public portfolio

The supplied specification requires the workflow Visitor → Tracking API → Database → Analytics Engine → Dashboard; this implementation follows that architecture.
