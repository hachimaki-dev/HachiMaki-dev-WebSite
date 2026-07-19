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
  components/ui/        → Primitives: Button, Input, Card, Modal, Toast, PageLoader, EmptyState, Badge, Countdown, NewsletterInvite, ThreatGlobe
  components/layout/    → Header, Footer, PageWrapper, AdminLayout
  pages/public/         → Home, Blog, BlogPost, Portfolio, ProjectDetail, PhotosPage, VisitantesPage, ContactPage, CoursesPage, CourseDetailPage, CourseLessonPage
  pages/public/Stream/  → StreamRoomPage, CasterPage, ViewerPage, StreamChat
  pages/admin/          → Dashboard, AdminBlog, BlogEditor, AdminPortfolio, ProjectEditor, Settings, AdminContactPage, AdminSubscriptionsPage, AdminCoursesPage, CourseEditor, LessonEditor
  pages/admin/Streams/  → AdminStreamsPage
  features/auth/        → useAuth, AuthGuard, LoginPage
  features/blog/        → useBlogPosts (public), useBlogAdmin (CRUD), useContentIndex
  features/courses/     → useCourses (public), useCoursesAdmin (CRUD)
  features/portfolio/   → useProjects (public), useProjectsAdmin (CRUD)
  features/visitor/     → useVisitorTracker, useVisitorLogs
  features/contact/     → useContact (public), useContactAdmin (CRUD)
  features/subscriptions/ → useSubscriptions (public), useSubscriptionsAdmin (CRUD)
  features/friends/     → useFriendLinks (public), useFriendLinksAdmin (CRUD)
  features/streaming/lib/    → signalingChannel, peerManager, viewerPeer, signalingCleanup, streamLogger
  features/streaming/hooks/  → useMediaDevices, useMediaRecorder, useRooms, usePresence, usePublicLiveStreams, useRecordingUpload, useChat, useSpeechTranscription
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
- `course_lessons` — lessons belonging to a course — Blog: `slug`, `title`, `excerpt`, `content`, `cover_url`, `published`, `published_at`
- `projects` — Portfolio: `slug`, `title`, `description`, `content`, `tags[]`, `featured`, `published`, `sort_order`
- `rooms` — Streaming rooms: `slug`, `title`, `caster_id`, `status` (offline/live/ended)
- `room_members` — Presence: `room_id`, `user_id`, `role` (caster/viewer)
- `stream_state` — Live state: `room_id`, `is_live`, `viewer_count`
- `signaling_messages` — WebRTC signaling: `room_id`, `sender_id`, `target_id`, `type`, `payload`
- `recordings` — Stream recordings: `room_id`, `caster_id`, `file_path`, `file_size`, `duration_ms`
- `chat_messages` — Live chat: `room_id`, `sender_id`, `display_name`, `message`
- `visitor_logs` — Visitor tracking logs: `session_id`, `visitor_id`, `ip`, `country`, `city`, `isp`, `browser`, `os`, `device_type`, `screen_resolution`, `referrer`, `page_path`, `action_type`, `action_details`, `canvas_fingerprint`, `gpu_model`, `visit_count`, `last_visit_date`
- `contact_messages` — Contact form messages: `id`, `name`, `email`, `subject`, `message`, `is_read`, `created_at`
- `subscriptions` — Newsletter/stream subscriptions: `id`, `email`, `subscribe_streams`, `subscribe_newsletter`, `created_at`
- `stream_transcriptions` — Stream speech transcriptions: `id`, `room_id`, `text`, `created_at`
- `friend_links` — Friend links exchange: `id`, `name`, `url`, `image_url`, `animation_type`, `sort_order`, `created_at`

RLS active: public read if `published=true`, write only for authenticated users.
Streaming: public read, signaling/chat open for anonymous viewers, write auth for rooms/recordings.
Contact & Subscriptions: insert open to public, full read/write for authenticated admin.

## Routes

```
Public:  /  /blog  /blog/:slug  /portfolio  /portfolio/:slug  /photos  /visitantes  /contacto  /login
         /cursos  /cursos/:slug  /cursos/:slug/:lessonSlug
         /stream/:slug  /stream/:slug/cast  /stream/:slug/watch
Admin:   /admin  /admin/blog  /admin/blog/new  /admin/blog/:id
         /admin/portfolio  /admin/portfolio/new  /admin/portfolio/:id
         /admin/settings  /admin/streams  /admin/contact  /admin/subscriptions
```

## Coding Rules

### MUST DO
- Use CSS Custom Properties from `tokens.css` for ALL colors, sizes, spacing, fonts
- Use kebab-case for CSS classes: `.blog-card`, `.admin-sidebar`
- One component per file, PascalCase naming: `BlogCard.jsx`
- Hooks with `use` prefix: `useBlogPosts.js`
- Always implement loading, error, and empty states for data-fetching components
- Use `useToast()` from `src/components/ui/Toast.jsx` for user notifications
- Max ~150 lines per component
- Use `useAuth()` inside children of `<AuthProvider>` (app is wrapped in it)
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
npm run dev      # Start development server
npm run build    # Production build (must pass with 0 errors)
npm run preview  # Preview production build locally
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
\n## 🔄 Auto-Maintenance Rule (MANDATORY)

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
- `photos` — custom photo gallery

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
