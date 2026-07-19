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
- `blog_posts` — blog with slug, title, content, published flag
- `courses` — IA, programming or software courses
- `course_lessons` — lessons belonging to a course
- `blog_tags` — blog taxonomy tags
- `blog_post_tags`
- `blog_reactions`
- `blog_comments` — blog post, course, and lesson comments
- `blog_series` — blog series collections
- `blog_posts` — blog with slug, title, content, published flag
- `courses` — IA, programming or software courses
- `course_lessons` — lessons belonging to a course — blog with slug, title, content, published flag
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
- `peer_libraries` — P2P file sharing libraries (with downloads_count, shares_count) (with downloads_count, shares_count) (with downloads_count, shares_count)
- `peer_alerts` — P2P offline alerts
- `p2p_signaling` — WebRTC P2P signaling
- `nexus_activity` — P2P activity log

RLS: public read when `published=true` or public list, writes require authentication.
Streaming: public read, anonymous signaling/chat, auth for rooms/recordings/transcriptions.
Contact & Subscriptions: public insert, authenticated admin read/write.

## Folder Conventions

```
src/components/blog/           → BlogShare, BlogReactions, BlogComments, MarkdownRenderer, TableOfContents, TagPills, PostMeta, SeriesNav, ContentIndex
src/components/ui/             → Reusable primitives (Button, Input, Card, Modal, NewsletterInvite, ThreatGlobe...)
src/components/layout/         → Header, Footer, PageWrapper, AdminLayout
src/pages/public/              → Public pages (Home, Blog, Portfolio, Contact)
src/pages/public/Stream/       → StreamRoomPage, CasterPage, ViewerPage, StreamChat
src/pages/public/Photos/       → PhotosPage
src/pages/public/Visitantes/   → VisitantesPage
src/pages/public/Nexus/        → NexusPage
src/pages/admin/               → Admin CRUD pages (behind AuthGuard - Dashboard, Settings, Contact, Subscriptions, Courses, CourseEditor, LessonEditor)
src/pages/admin/Streams/       → AdminStreamsPage
src/pages/admin/Photos/        → AdminPhotosPage
src/features/{domain}/         → Domain hooks & helpers (auth, blog, portfolio, streaming, visitor, contact, subscriptions)
src/features/streaming/lib/    → signalingChannel, peerManager, viewerPeer, signalingCleanup, streamLogger
src/features/streaming/hooks/  → useMediaDevices, useMediaRecorder, useRooms, usePresence, usePublicLiveStreams, useRecordingUpload, useChat, useSpeechTranscription
src/features/visitor/hooks/    → useVisitorTracker, useVisitorLogs
src/features/contact/          → useContact, useContactAdmin
src/features/subscriptions/    → useSubscriptions, useSubscriptionsAdmin
src/features/friends/          → useFriendLinks, useFriendLinksAdmin
src/features/nexus/            → useNexusLibrary, fileSystemDb, p2pDataChannel, nexusSignaling
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

## How to Create a Tutorial (For AI Agents)

When the user asks you to "create a tutorial" or "create a course", DO NOT try to modify React files or create `.md` files in `src/`. Instead, use the provided script to save it as a draft in the database.

**IMPORTANT SECURITY NOTE**: The database uses Row Level Security (RLS). To bypass RLS and insert data programmatically, the script requires the Supabase Service Role Key.
1. Check if `SUPABASE_SERVICE_ROLE_KEY` is present in `.env`.
2. If it is NOT present, tell the user they must add their service role key to `.env` before you can proceed (they can find it in Supabase Dashboard -> Settings -> API).
3. NEVER expose the service role key in client code (never use `VITE_` prefix for it).

**Creation & Update Workflow:**
1. Create or edit a temporary JSON file (e.g., `_drafts/my-course.json`) with the structure:
```json
{
  "title": "Aprende React",
  "description": "Curso completo.",
  "category": "Programación",
  "difficulty": "Intermedio",
  "lessons": [
    {
      "title": "Introducción",
      "excerpt": "Qué es React.",
      "content": "Contenido en markdown aquí..."
    }
  ]
}
```
2. Run the script: `node scripts/agent-create-course.js _drafts/my-course.json`
3. The script is idempotent: if a course with the same slug already exists, it updates the course and its lessons in-place (updating existing lessons, inserting new ones, and deleting any obsolete ones), preserving their original IDs and publication states.
4. Tell the user it has been saved as a draft or updated.

**Publication Rules:**
- New courses and new lessons are always created with `published: false` (Draft status).
- Existing published courses/lessons retain their publication status when updated.
- DO NOT attempt to publish the course directly via the database script.
- Instruct the user to go to the Admin panel at `/admin/courses` to review, edit, and manually publish the course when they are ready.

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
