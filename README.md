# Analytics Dashboard Challenge

A social media analytics dashboard built with Next.js 16, React 19, and Supabase. Track engagement metrics, analyze post performance, and visualize trends across Instagram and TikTok.

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/` directory to create the `posts` and `daily_metrics` tables
3. Enable Row Level Security (RLS) policies for user data isolation

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |

## Architecture Decisions and Trade-offs

### Tech Stack Choices

**Next.js 16 with App Router**
- Chose App Router for React Server Components support and improved data fetching patterns
- Trade-off: Slightly steeper learning curve but better performance and DX in the long run

**Zustand for Client State**
- Lightweight alternative to Redux for dashboard filters (date range, pagination, sorting)
- Trade-off: Less boilerplate than Redux, but fewer dev tools available

**TanStack Query for Server State**
- Handles caching, refetching, and loading states for API data
- Trade-off: Additional dependency, but significantly simplifies data fetching logic

**Supabase for Backend**
- Provides auth, database, and RLS out of the box
- Trade-off: Vendor lock-in, but rapid development and built-in security

### Architecture Patterns

**API Routes with Edge Runtime**
- `/api/metrics/daily` uses Edge runtime for low-latency responses
- Trade-off: Some Node.js APIs unavailable, but faster cold starts globally

**In-Memory Rate Limiting**
- Simple rate limiter without external dependencies
- Trade-off: Won't work across multiple instances; production should use Redis/Upstash

**Component Structure**
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard page
│   ├── login/             # Auth pages
│   └── signup/
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── auth/              # Authentication forms
│   ├── charts/            # Data visualization components
│   └── posts/             # Posts table and detail modal
├── hooks/                 # Custom React hooks (data fetching)
├── lib/                   # Utilities, validations, Supabase clients
├── stores/                # Zustand state stores
└── types/                 # TypeScript type definitions
```

**State Management Strategy**
- Server state (posts, metrics): TanStack Query with automatic refetching
- Client state (filters, pagination): Zustand store
- Form state: React Hook Form with Zod validation

### Security Measures

- Row Level Security (RLS) ensures users only access their own data
- Rate limiting on API routes (100 requests/minute)
- Security headers (HSTS, X-Frame-Options, CSP, etc.)
- Input validation with Zod schemas
- Server-side auth validation on all protected routes

## What I'd Improve With More Time

### Performance
- [ ] Add Redis-based rate limiting for multi-instance deployments
- [ ] Implement data aggregation at the database level for large datasets
- [ ] Add virtualized scrolling for large post lists
- [ ] Optimize bundle size with dynamic imports

### Features
- [ ] Add CSV/PDF export for analytics reports
- [ ] Implement real-time updates with Supabase subscriptions
- [ ] Add more chart types (pie charts, heatmaps)
- [ ] Create comparison views between platforms
- [ ] Add date range custom picker (not just presets)

### Testing
- [ ] Add E2E tests with Playwright
- [ ] Increase unit test coverage (currently covers API routes)
- [ ] Add visual regression tests for charts
- [ ] Add load testing for API endpoints

### Developer Experience
- [ ] Add Storybook for component documentation
- [ ] Set up GitHub Actions CI/CD pipeline
- [ ] Add pre-commit hooks with Husky
- [ ] Create seed script for demo data

### Infrastructure
- [ ] Add error tracking (Sentry)
- [ ] Implement structured logging
- [ ] Add APM monitoring
- [ ] Set up staging environment

## Time Spent

**Total: 6-8 hours**

| Task | Time |
|------|------|
| Initial setup & auth flow | 1.5 hrs |
| Dashboard layout & components | 1.5 hrs |
| API routes & data fetching | 1.5 hrs |
| Charts & visualizations | 1 hr |
| State management & filters | 1 hr |
| Testing & security | 1 hr |
| Bug fixes & polish | 0.5 hrs |

## Tech Stack

- **Framework**: Next.js 16.1.3 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand + TanStack Query
- **Charts**: Chart.js + react-chartjs-2
- **Backend**: Supabase (Auth + PostgreSQL)
- **Testing**: Vitest
- **Linting**: Biome
