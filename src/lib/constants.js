/**
 * constants.js — Global configuration & route constants
 * hachimaki.dev
 */

/* ── Public routes ── */
export const ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
  BLOG_TAG: '/blog/tag/:slug',
  BLOG_SERIES: '/blog/series/:slug',
  PORTFOLIO: '/portfolio',
  PROJECT: '/portfolio/:slug',
  PHOTOS: '/photos',
  VISITORS: '/visitantes',
  LOGIN: '/login',
  CONTACT: '/contacto',

  /* Streaming routes */
  STREAM_ROOM: '/stream/:slug',
  STREAM_CAST: '/stream/:slug/cast',

  /* Admin routes */
  ADMIN: '/admin',
  ADMIN_BLOG: '/admin/blog',
  ADMIN_BLOG_NEW: '/admin/blog/new',
  ADMIN_BLOG_EDIT: '/admin/blog/:id',
  ADMIN_PORTFOLIO: '/admin/portfolio',
  ADMIN_PORTFOLIO_NEW: '/admin/portfolio/new',
  ADMIN_PORTFOLIO_EDIT: '/admin/portfolio/:id',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_STREAMS: '/admin/streams',
  ADMIN_PHOTOS: '/admin/photos',
  ADMIN_CONTACT: '/admin/contact',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_FRIEND_LINKS: '/admin/links',
  ADMIN_BLOG_TAGS: '/admin/blog/tags',
  ADMIN_BLOG_SERIES: '/admin/blog/series',
}

/* ── Supabase tables ── */
export const TABLES = {
  PROFILES: 'profiles',
  BLOG_POSTS: 'blog_posts',
  BLOG_TAGS: 'blog_tags',
  BLOG_POST_TAGS: 'blog_post_tags',
  BLOG_SERIES: 'blog_series',
  PROJECTS: 'projects',
  ROOMS: 'rooms',
  ROOM_MEMBERS: 'room_members',
  STREAM_STATE: 'stream_state',
  SIGNALING: 'signaling_messages',
  RECORDINGS: 'recordings',
  CHAT_MESSAGES: 'chat_messages',
  PHOTOS: 'photos',
  VISITOR_LOGS: 'visitor_logs',
  CONTACT_MESSAGES: 'contact_messages',
  SUBSCRIPTIONS: 'subscriptions',
  STREAM_TRANSCRIPTIONS: 'stream_transcriptions',
  FRIEND_LINKS: 'friend_links',
}

/* ── Site metadata ── */
export const SITE = {
  NAME: 'hachimaki.dev',
  TITLE: 'hachimaki.dev — Developer & Creator',
  DESCRIPTION: 'Personal website, blog, and portfolio.',
  URL: 'https://hachimaki-dev.github.io/hachimaki-dev',
}

/* ── Pagination ── */
export const PAGINATION = {
  BLOG_PAGE_SIZE: 10,
  BLOG_RELATED_COUNT: 3,
  PORTFOLIO_PAGE_SIZE: 12,
}

/* ── Content ── */
export const MAX_EXCERPT_LENGTH = 160
