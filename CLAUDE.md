# CLAUDE.md — Project context for Claude Code & Claude

> This file is automatically loaded by Claude Code at the start of every session.
> It provides essential project context to avoid redundant questions.

## Project

**hachimaki-dev** — Personal website: landing + blog + portfolio + private admin panel.
Single admin user authenticated via Supabase. Deployed to GitHub Pages.

## Stack

- **Frontend:** React 18 + Vite (JavaScript, NOT TypeScript)
- **Styles:** CSS nativo con Custom Properties (`src/styles/tokens.css`). No frameworks CSS.
- **Auth + DB:** Supabase (Auth, PostgreSQL, Storage)
- **Deploy:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)

## Directory Structure

```
src/
  components/ui/        → Primitives: Button, Input, Card, Modal, Toast, PageLoader, EmptyState, Badge, Countdown
  components/layout/    → Header, Footer, PageWrapper, AdminLayout
  pages/public/         → Home, Blog, BlogPost, Portfolio, ProjectDetail
  pages/public/Stream/  → StreamRoomPage, CasterPage, ViewerPage, StreamChat
  pages/admin/          → Dashboard, AdminBlog, BlogEditor, AdminPortfolio, ProjectEditor, Settings
  pages/admin/Streams/  → AdminStreamsPage
  features/auth/        → useAuth, AuthGuard, LoginPage
  features/blog/        → useBlogPosts (public), useBlogAdmin (CRUD)
  features/portfolio/   → useProjects (public), useProjectsAdmin (CRUD)
  features/streaming/lib/    → signalingChannel, peerManager, viewerPeer, signalingCleanup, streamLogger
  features/streaming/hooks/  → useMediaDevices, useMediaRecorder, useRooms, usePresence, usePublicLiveStreams, useRecordingUpload, useChat
  hooks/                → useLocalStorage, useMediaQuery
  utils/                → formatDate, slugify, truncate
  lib/supabase.js       → Supabase client singleton — NEVER create new instances
  lib/constants.js      → Routes, table names, site metadata
  styles/tokens.css     → ALL design tokens — ALWAYS use these variables
  router.jsx            → React Router v6 with lazy loading
  main.jsx              → Entry point
migrations/             → Local SQL files, in .gitignore — NEVER commit
```

## Supabase Tables

- `profiles` — Admin profile (1 row): `id`, `display_name`, `bio`, `avatar_url`
- `blog_posts` — Blog: `slug`, `title`, `excerpt`, `content`, `cover_url`, `published`, `published_at`
- `projects` — Portfolio: `slug`, `title`, `description`, `content`, `tags[]`, `featured`, `published`, `sort_order`
- `rooms` — Streaming rooms: `slug`, `title`, `caster_id`, `status` (offline/live/ended)
- `room_members` — Presence: `room_id`, `user_id`, `role` (caster/viewer)
- `stream_state` — Live state: `room_id`, `is_live`, `viewer_count`
- `signaling_messages` — WebRTC signaling: `room_id`, `sender_id`, `target_id`, `type`, `payload`
- `recordings` — Stream recordings: `room_id`, `caster_id`, `file_path`, `file_size`, `duration_ms`
- `chat_messages` — Live chat: `room_id`, `sender_id`, `display_name`, `message`

RLS active: public read if `published=true`, write only for authenticated users.
Streaming: public read, signaling/chat open for anonymous viewers, write auth for rooms/recordings.

## Routes

```
Public:  /  /blog  /blog/:slug  /portfolio  /portfolio/:slug  /login
         /stream/:slug  /stream/:slug/cast  /stream/:slug/watch
Admin:   /admin  /admin/blog  /admin/blog/new  /admin/blog/:id
         /admin/portfolio  /admin/portfolio/new  /admin/portfolio/:id
         /admin/settings  /admin/streams
```

## Coding Rules

### MUST DO
- Use CSS Custom Properties from `tokens.css` for ALL colors, sizes, spacing, fonts
- Use kebab-case for CSS classes: `.blog-card`, `.admin-sidebar`
- One component per file, PascalCase naming: `BlogCard.jsx`
- Hooks with `use` prefix: `useBlogPosts.js`
- Handle loading, error, and empty states in every async component
- Show user feedback via toast notifications (use `useToast()` hook)
- Import Supabase client from `src/lib/supabase.js` only

### MUST NOT DO
- ❌ Do NOT use TypeScript (`.ts` / `.tsx`) — project is JS only
- ❌ Do NOT install CSS frameworks (Tailwind, Bootstrap, Chakra, etc.)
- ❌ Do NOT hardcode colors, sizes, or fonts — always use CSS variables
- ❌ Do NOT use `localStorage` for business data — only Supabase
- ❌ Do NOT create new Supabase client instances
- ❌ Do NOT commit `migrations/` or `.env` files
- ❌ Do NOT use `!important` in CSS
- ❌ Do NOT leave `console.log` debug statements

### DB Schema Changes
1. Create file in `migrations/NNN_description.sql`
2. Include CREATE/ALTER, RLS policies, indexes
3. Update `migrations/README.md`
4. NEVER modify DB schema from frontend code

### New Routes
1. Define in `src/router.jsx`
2. Protected routes → wrap in `<AuthGuard>`
3. Create page in `src/pages/public/` or `src/pages/admin/`

## Environment Variables

```
VITE_SUPABASE_URL     — Supabase project URL
VITE_SUPABASE_ANON_KEY — Supabase anonymous key (public)
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## 🔄 Auto-Maintenance Rule (MANDATORY)

**After every iteration that modifies the project architecture, you MUST update ALL agent config files to keep them in sync.** This includes:

- **Adding/removing/renaming** a component, page, hook, utility, or route
- **Adding/renaming** a Supabase table or column
- **Adding/removing** a CSS token or design system change
- **Adding/removing** a dependency
- **Changing** folder structure or naming conventions

### What to update

All of these files must reflect the current state of the project:

| File | Purpose |
|---|---|
| `CLAUDE.md` | Claude Code / Claude |
| `AGENTS.md` | OpenAI Codex CLI |
| `GEMINI.md` | Gemini CLI / Google AI |
| `.cursorrules` | Cursor |
| `.windsurfrules` | Windsurf / Codeium |
| `.clinerules` | Cline / Roo Code |
| `.github/copilot-instructions.md` | GitHub Copilot |

> **Do NOT ask for permission.** If the change affects any section documented in these files (structure, tables, routes, components, rules), update them automatically as part of the same task.
