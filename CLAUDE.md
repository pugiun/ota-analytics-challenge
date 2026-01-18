# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (opens at http://localhost:3000)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint` (uses Biome)
- **Format code**: `npm run format` (uses Biome with auto-fix)

## Architecture Overview

This is a Next.js 16 application using the App Router architecture with React 19. The project is set up for an analytics challenge and includes charting capabilities.

### Tech Stack

- **Framework**: Next.js 16.1.3 with App Router
- **React**: 19.2.3
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
- **State Management**: Zustand for global state, TanStack Query for server state
- **Data Visualization**: Chart.js with react-chartjs-2, plus Visx for advanced visualizations
- **Backend**: Supabase (with SSR support)
- **UI Components**: Radix UI primitives with shadcn/ui
- **Code Quality**: Biome (linter + formatter)
- **Animations**: Framer Motion

### Project Structure

- **`src/app/`**: Next.js App Router pages and layouts
  - Uses Geist Sans and Geist Mono fonts from next/font
  - Root layout in `layout.tsx`, home page in `page.tsx`
- **`src/components/ui/`**: shadcn/ui components (button, card, dialog, table, select, skeleton)
- **`src/lib/`**: Utility functions
  - `utils.ts`: Contains the `cn()` helper for Tailwind class merging

### Path Aliases

The project uses TypeScript path aliases configured in both `tsconfig.json` and `components.json`:
- `@/*` maps to `./src/*`
- `@/components` → UI components
- `@/lib` → Utility functions
- `@/hooks` → Custom React hooks
- `@/components/ui` → shadcn/ui components

### Biome Configuration

The project uses Biome instead of ESLint/Prettier:
- Configured with Next.js and React recommended rules
- 2-space indentation
- Auto-organizes imports when enabled
- VCS integration enabled for Git

### shadcn/ui Setup

Components are configured with:
- Style: "new-york"
- RSC (React Server Components) enabled
- Icon library: lucide-react
- Base color: slate
- CSS variables enabled for theming

### Key Dependencies

- **Data Tables**: @tanstack/react-table for table management
- **Charts**: chart.js + react-chartjs-2 for basic charts, @visx/* for advanced visualizations
- **Animations**: framer-motion for UI animations
- **Database**: @supabase/supabase-js with SSR support
- **Styling utilities**: clsx, tailwind-merge, class-variance-authority
- **Form validation**: zod + react-hook-form with @hookform/resolvers

## Authentication

The application uses Supabase Authentication with email/password sign-in.

### Supabase Client Setup

- **Client-side**: `src/lib/supabase/client.ts` - Use `createClient()` in Client Components
- **Server-side**: `src/lib/supabase/server.ts` - Use `createClient()` in Server Components and Server Actions
- Environment variables are configured in `.env.local`

### Auth Pages and Routes

- **Sign up**: `/signup` - New user registration with email confirmation
- **Login**: `/login` - User authentication
- **Dashboard**: `/dashboard` - Protected route (requires authentication)
- **Auth callback**: `/auth/callback` - Handles email confirmation redirects

### Authentication Flow

1. Users sign up at `/signup` with email/password (validated with Zod schemas)
2. Supabase sends a confirmation email
3. After email confirmation, users are redirected to `/dashboard` via `/auth/callback`
4. Users can sign in at `/login` with their credentials
5. Authenticated users are automatically redirected away from auth pages

### Proxy (Request Handler)

The `proxy.ts` file (Next.js 16 convention, replaces deprecated middleware):
- Refreshes Supabase auth sessions on every request
- Protects `/dashboard` routes (redirects unauthenticated users to `/login`)
- Redirects authenticated users away from `/login` and `/signup` pages

### Test Users

Pre-seeded test accounts for development:
- **User A**: `analyticsusera@gmail.com` / `Password123`
- **User B**: `analyticsuserb@gmail.com` / `Password123`

### Database Seeding

To seed/reset the database:
1. Create users: `SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx supabase/seed-users.ts`
2. Seed data: `npx tsx supabase/run-seed.ts`

Note: `@example.com` emails are blocked by Supabase - use real email domains for test users.

### Server Actions

Auth actions are defined in `src/app/actions/auth.ts`:
- `signUp(data)` - Creates a new user account
- `signIn(data)` - Authenticates a user
- `signOut()` - Signs out the current user

### Form Validation

Zod schemas in `src/lib/validations/auth.ts`:
- `signUpSchema` - Validates email, password strength, and password confirmation
- `signInSchema` - Validates email and password for login

### Database Tables

- **posts**: Stores social media posts (Instagram/TikTok) with engagement metrics
- **daily_metrics**: Stores daily aggregated engagement and reach data
- Both tables have Row Level Security (RLS) policies ensuring users can only access their own data
