# E-Commerce Store

A full-featured e-commerce platform built with Next.js 16, featuring a customer storefront and a comprehensive admin dashboard. Includes product catalog, shopping cart, checkout, order management, analytics, and multi-language support.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM 7
- **UI:** HeroUI + Tailwind CSS 4
- **Auth:** JWT-based sessions (HTTP-only cookies)
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Email:** Resend (optional)
- **i18n:** next-intl
- **Charts:** Recharts
- **Rich Text:** Tiptap

## Features

### Storefront

- Product catalog with category filtering and search
- Product detail pages with image gallery, variants, and reviews
- Shopping cart with validation
- Checkout flow with address management
- Order history and tracking
- User registration and authentication
- Wishlist
- Responsive design with page transitions
- Multi-language support

### Admin Dashboard

- Product management (CRUD, bulk CSV/Excel import)
- Order management with status tracking
- Customer and user management
- Category management
- Banner and CMS page management
- Store settings (branding, tax, shipping, social links)
- Product feed generation (Google Shopping, Facebook)
- Analytics dashboard with KPIs and revenue charts
- Review moderation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/yaroslav-tsarenko/e-commerce-store.git
cd e-commerce-store
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Prisma Postgres protocol URL | Yes |
| `DIRECT_URL` | Direct PostgreSQL connection URL | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | Yes |
| `RESEND_API_KEY` | Resend API key for emails | No |
| `RESEND_FROM_EMAIL` | Sender email address | No |

### Database Setup

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

The seed script creates sample categories, a test customer (`test@gmail.com` / `test123!`), and an admin user (`admin@gmail.com` / `admin123!`).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Localized storefront routes
│   │   ├── auth/          # Login, register
│   │   ├── catalog/       # Product catalog
│   │   ├── product/[slug] # Product detail
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout
│   │   └── account/       # Profile, orders, wishlist, addresses
│   ├── admin/             # Admin dashboard
│   └── api/               # 30+ REST API endpoints
├── components/
│   ├── admin/             # Admin-specific components
│   ├── home/              # Homepage components
│   ├── product/           # Product display
│   ├── catalog/           # Catalog components
│   ├── cart/              # Cart components
│   ├── checkout/          # Checkout components
│   ├── layout/            # Header, footer, navigation
│   └── shared/            # Reusable UI components
├── lib/                   # Utilities, API clients, auth, Prisma client
├── providers/             # React context (Auth, Cart, Theme, Toast)
├── types/                 # TypeScript type definitions
├── validators/            # Zod validation schemas
└── i18n/                  # Internationalization config
prisma/
├── schema.prisma          # Database schema (14 models)
└── seed.ts                # Seed data
scripts/                   # Dev server orchestration, data generation
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Prisma + Next.js) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## API Overview

The API provides endpoints for:

- **Auth** — register, login, logout, session management
- **Products** — CRUD, search, filtering, bulk operations
- **Categories** — hierarchy management
- **Orders** — creation, status updates, history
- **Cart** — add, update, remove, validate
- **Checkout** — process orders with address selection
- **Customers & Users** — management endpoints
- **Reviews** — submission and moderation
- **Wishlist** — add/remove items
- **Settings** — store configuration
- **Feeds** — Google Shopping, Facebook product feeds
- **Import** — CSV/Excel product import with preview
- **Analytics** — KPIs and revenue data
- **Upload** — Image upload

## Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel
```

Set the required environment variables in your Vercel project settings before deploying.

## License

MIT
