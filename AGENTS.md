# AGENTS.md — Project context for OpenAI Codex CLI

## Identity

**hachimaki-dev** — Personal website with landing, blog, portfolio, and admin panel.
Single admin user. React 18 + Vite + CSS native + Supabase. GitHub Pages deploy.

## Key Files

| Path | Purpose |
|---|---|
| `src/lib/supabase.js` | Supabase client singleton — import from here ONLY |
| `src/lib/constants.js` | Routes, table names, site config |
| `src/styles/tokens.css` | Design tokens — ALL CSS variables live here |
| `src/router.jsx` | React Router v6 — public & protected routes |
| `src/features/auth/AuthGuard.jsx` | Protects `/admin/*` routes |
| `migrations/` | Local SQL — in .gitignore, never commit |

## Tech Constraints

- **JavaScript only** — no `.ts` or `.tsx` files
- **CSS native only** — no Tailwind, Bootstrap, Chakra, or any CSS framework
- **Supabase only** — no localStorage for business data, no custom auth logic
- **Single Supabase instance** — always import from `src/lib/supabase.js`
- **CSS variables only** — never hardcode colors, sizes, or fonts

## CSS Design System

All values come from `src/styles/tokens.css`:
- Colors: `--color-bg`, `--color-surface`, `--color-accent (#c8f000)`, `--color-text`, etc.
- Typography: `--font-sans (Space Grotesk)`, `--font-mono (JetBrains Mono)`
- Spacing: `--space-1` through `--space-32` (4px scale)
- Classes: kebab-case (`.blog-card__title`, `.btn-primary`)

## Database Tables (Supabase PostgreSQL)

- `profiles` — single admin profile row
- `blog_posts` — blog with slug, title, content, published flag
- `projects` — portfolio with slug, tags[], featured, sort_order
- `rooms` — streaming rooms with slug, caster_id, status, is_private
- `room_passwords` — secures passwords for private rooms
- `room_members` — presence tracking per room
- `stream_state` — live status + viewer count
- `signaling_messages` — WebRTC SDP/ICE exchange
- `recordings` — stream recordings in Supabase Storage
- `chat_messages` — live chat per room
- `photos` — custom photo gallery
- `visitor_logs` — visitor activity logs

RLS: public read when `published=true`, writes require authentication.
Streaming: public read, anonymous signaling/chat, auth for rooms/recordings.

## Folder Conventions

```
src/components/ui/             → Reusable primitives (Button, Input, Card, Modal...)
src/components/layout/         → Header, Footer, PageWrapper, AdminLayout
src/pages/public/              → Public pages (Home, Blog, Portfolio)
src/pages/public/Stream/       → StreamRoomPage, CasterPage, ViewerPage, StreamChat
src/pages/public/Photos/       → PhotosPage
src/pages/public/Visitantes/   → VisitantesPage
src/pages/admin/               → Admin CRUD pages (behind AuthGuard)
src/pages/admin/Streams/       → AdminStreamsPage
src/pages/admin/Photos/        → AdminPhotosPage
src/features/{domain}/         → Domain hooks & helpers (auth, blog, portfolio, streaming, visitor)
src/features/streaming/lib/    → signalingChannel, peerManager, viewerPeer, signalingCleanup, streamLogger
src/features/streaming/hooks/  → useMediaDevices, useMediaRecorder, useRooms, usePresence, usePublicLiveStreams, useRecordingUpload, useChat
src/features/visitor/hooks/    → useVisitorTracker, useVisitorLogs
src/hooks/                     → Generic hooks (useMediaQuery, useLocalStorage)
src/utils/                     → Pure functions (formatDate, slugify, truncate)
```

## Component Rules

- One component per file, PascalCase: `BlogCard.jsx`
- Always handle: loading state, error state, empty state
- Props documented with JSDoc (no PropTypes needed)
- Max ~150 lines per component — split if larger
- Extract data logic to hooks in `features/`

## Commands

```bash
npm run dev      # Dev server
npm run build    # Prod build (must pass with 0 errors)
```

## 🔄 Auto-Maintenance (MANDATORY)

After every change that modifies the project architecture (new/renamed/removed components, pages, hooks, routes, tables, tokens, or dependencies), you MUST update ALL agent config files to keep them in sync:

`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`

Do this automatically as part of the same task. Do not ask for permission.
