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
- Colors: `--color-bg`, `--color-surface`, `--color-accent (#8b5cf6)`, `--color-text`, etc.
- Typography: `--font-sans (Space Grotesk)`, `--font-mono (JetBrains Mono)`
- Spacing: `--space-1` through `--space-32` (4px scale)
- Classes: kebab-case (`.blog-card__title`, `.btn-primary`)

## Database Tables (Supabase PostgreSQL)

- `profiles` — single admin profile row
- `blog_posts`
- `blog_tags` — blog taxonomy tags
- `blog_post_tags` — many-to-many tags
- `blog_series` — blog series collections
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
- `visitor_logs` — session_id, visitor_id, ip, country, city, browser, os, action_type, action_details, canvas_fingerprint, gpu_model, visit_count
- `contact_messages` — contact form messages
- `subscriptions` — newsletter/stream subscriptions
- `stream_transcriptions` — stream speech transcriptions
- `friend_links` — website buttons showcase (linkeame)

RLS: public read when `published=true` or public list, writes require authentication.
Streaming: public read, anonymous signaling/chat, auth for rooms/recordings/transcriptions.
Contact & Subscriptions: public insert, authenticated admin read/write.

## Folder Conventions

```
src/components/blog/           → MarkdownRenderer, TableOfContents, TagPills, PostMeta, SeriesNav
src/components/ui/             → Reusable primitives (Button, Input, Card, Modal, NewsletterInvite...)
src/components/layout/         → Header, Footer, PageWrapper, AdminLayout
src/pages/public/              → Public pages (Home, Blog, Portfolio, Contact)
src/pages/public/Stream/       → StreamRoomPage, CasterPage, ViewerPage, StreamChat
src/pages/public/Photos/       → PhotosPage
src/pages/public/Visitantes/   → VisitantesPage
src/pages/admin/               → Admin CRUD pages (behind AuthGuard - Dashboard, Settings, Contact, Subscriptions)
src/pages/admin/Streams/       → AdminStreamsPage
src/pages/admin/Photos/        → AdminPhotosPage
src/features/{domain}/         → Domain hooks & helpers (auth, blog, portfolio, streaming, visitor, contact, subscriptions)
src/features/streaming/lib/    → signalingChannel, peerManager, viewerPeer, signalingCleanup, streamLogger
src/features/streaming/hooks/  → useMediaDevices, useMediaRecorder, useRooms, usePresence, usePublicLiveStreams, useRecordingUpload, useChat, useSpeechTranscription
src/features/visitor/hooks/    → useVisitorTracker, useVisitorLogs
src/features/contact/          → useContact, useContactAdmin
src/features/subscriptions/    → useSubscriptions, useSubscriptionsAdmin
src/features/friends/          → useFriendLinks, useFriendLinksAdmin
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
npm test         # Run unit tests via Vitest
```


## UI / UX Guidelines (Retro VHS / Surveillance System)

1. **Aesthetic Identity**: The public-facing site follows a Retro VHS / Surveillance / Cyberpunk aesthetic.
2. **Key Elements**:
   - **Monospace Fonts**: Use var(--font-mono) for metadata, badges, system logs, dates, and IDs.
   - **Sans-serif Fonts**: Use var(--font-sans) for primary titles and heavy readable text.
   - **Terminal Language**: Use technical/system terms in uppercase (e.g., TRANSMISIONES, SEÑAL ACTIVA, DECODIFICANDO, ERROR DE TRANSMISIÓN).
   - **Badges & Glows**: Active or primary states should use the var(--color-accent) with subtle glows (box-shadow).
   - **Scanlines & Noise**: Use .vhs-scanlines.vhs-noise backgrounds for the main page wrappers.
   - **Feed Items (Cards)**: Use blog-feed-item or .outsider__feed-item style (border-left accent, dashed inner shadows, terminal header).
   - **Colors**: Rely exclusively on src/styles/tokens.css. Primary accent is --color-accent (#8b5cf6).
3. **Animations**: Use micro-animations like animate-slide-up for loading content, glow-pulse for status dots, and image scaling on hover.
   4. **Icons**: Use `pixelarticons` exclusively via the `<Icon name="..." />` component (from `src/components/ui/Icon.jsx`). Do not use inline SVGs.
\n## 🔄 Auto-Maintenance (MANDATORY)

After every change that modifies the project architecture (new/renamed/removed components, pages, hooks, routes, tables, tokens, or dependencies), you MUST update ALL agent config files to keep them in sync:

`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`

Do this automatically as part of the same task. Do not ask for permission.
