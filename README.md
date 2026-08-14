# Boardverse

Boardverse is a full-stack chess platform built as a portfolio project around a
real product-shaped problem: authenticated players, live games, social features
and persistent statistics in one application.

## Product highlights

- Play chess locally, online or against Stockfish
- Create and join timed games
- Register, sign in and recover accounts with Supabase Auth
- Add friends and exchange private messages
- Complete chess challenges and track personal statistics
- Use the interface in Italian, English, French, German or Spanish
- Personalise profile, theme and account settings

## Technical overview

| Area | Implementation |
| --- | --- |
| Web application | Next.js App Router, React and TypeScript |
| Data and Auth | Supabase Auth and PostgreSQL |
| Chess logic | `chess.js`, Stockfish integration and custom UI state |
| Interface | Tailwind CSS, Headless UI and Three.js assets |
| Charts | Recharts |
| Testing | Vitest and Playwright |
| Delivery | GitHub Actions with type, lint, test and build checks |

The application keeps privileged Supabase access on the server. Database changes
are versioned in `supabase/migrations`, including Row Level Security policies,
restricted grants and authenticated RPCs for sensitive game operations.

## Repository structure

```text
src/app/                 # pages, route handlers and UI components
services/                # application-level data operations
lib/                     # Supabase clients, auth helpers and shared utilities
src/lib/                 # chess and Stockfish logic with unit tests
supabase/migrations/     # database security and schema changes
tests/                   # Playwright smoke tests
.github/workflows/       # continuous integration
```

## Run locally

Requirements: Node.js 22, npm and access to a compatible Supabase project.

```bash
git clone https://github.com/JakeKing0001/boardverse.git
cd boardverse
cp .env.example .env.local
npm ci
npm run dev
```

Complete `.env.local` with the values requested by `.env.example`. The
publishable key is intended for browser use; `SUPABASE_SECRET_KEY` is server-only
and must never be prefixed with `NEXT_PUBLIC_` or committed.

The migrations in this repository evolve the project's existing schema. Review
them against a development Supabase project before applying them to another
database; they are not presented as a one-command bootstrap for an unrelated
fresh project.

## Quality checks

```bash
npm run lint
npm test
npm run build
npm run test:ui -- --project=desktop
```

The CI workflow runs type checking, linting, unit tests, a production build and
the desktop browser smoke suite for pushes and pull requests.

## Security notes

- Authentication state is verified server-side before privileged operations.
- User-facing data access is constrained by RLS and explicit database grants.
- Security-definer functions use limited entry points and explicit execute
  permissions.
- Local credentials and Supabase temporary files are ignored by Git.

Boardverse is an actively developed portfolio project, not a hosted commercial
service or a substitute for an independent production security review. Before a
real deployment, validate the target schema, run Supabase security advisors,
review rate limits and exercise the full authentication and multiplayer flows in
a staging environment.

## License

Released under the [MIT License](LICENSE).
