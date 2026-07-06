import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { AdminLayout } from './components/layout/AdminLayout'
import { AuthGuard } from './features/auth/AuthGuard'
import { PageLoader } from './components/ui/PageLoader'
import { RouteErrorFallback } from './components/ui/ErrorFallback'

/* ── Lazy load pages ── */
const HomePage = lazy(() => import('./pages/public/Home/HomePage').then(m => ({ default: m.HomePage })))
const BlogPage = lazy(() => import('./pages/public/Blog/BlogPage').then(m => ({ default: m.BlogPage })))
const BlogPostPage = lazy(() => import('./pages/public/Blog/BlogPostPage').then(m => ({ default: m.BlogPostPage })))
const BlogTagPage = lazy(() => import('./pages/public/Blog/BlogTagPage').then(m => ({ default: m.BlogTagPage })))
const BlogSeriesPage = lazy(() => import('./pages/public/Blog/BlogSeriesPage').then(m => ({ default: m.BlogSeriesPage })))
const PortfolioPage = lazy(() => import('./pages/public/Portfolio/PortfolioPage').then(m => ({ default: m.PortfolioPage })))
const ProjectDetailPage = lazy(() => import('./pages/public/Portfolio/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })))
const PhotosPage = lazy(() => import('./pages/public/Photos/PhotosPage').then(m => ({ default: m.PhotosPage })))
const VisitantesPage = lazy(() => import('./pages/public/Visitantes/VisitantesPage').then(m => ({ default: m.VisitantesPage })))
const ContactPage = lazy(() => import('./pages/public/Contact/ContactPage').then(m => ({ default: m.ContactPage })))
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })))

import { useVisitorTracker } from './features/visitor/hooks/useVisitorTracker'

/* ── Streaming pages ── */
const StreamRoomPage = lazy(() => import('./pages/public/Stream/StreamRoomPage').then(m => ({ default: m.StreamRoomPage })))
const CasterPage = lazy(() => import('./pages/public/Stream/CasterPage').then(m => ({ default: m.CasterPage })))
const ViewerPage = lazy(() => import('./pages/public/Stream/ViewerPage').then(m => ({ default: m.ViewerPage })))

const DashboardPage = lazy(() => import('./pages/admin/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AdminBlogPage = lazy(() => import('./pages/admin/Blog/AdminBlogPage').then(m => ({ default: m.AdminBlogPage })))
const BlogEditor = lazy(() => import('./pages/admin/Blog/BlogEditor').then(m => ({ default: m.BlogEditor })))
const AdminTagsPage = lazy(() => import('./pages/admin/Blog/AdminTagsPage').then(m => ({ default: m.AdminTagsPage })))
const AdminSeriesPage = lazy(() => import('./pages/admin/Blog/AdminSeriesPage').then(m => ({ default: m.AdminSeriesPage })))
const AdminPortfolioPage = lazy(() => import('./pages/admin/Portfolio/AdminPortfolioPage').then(m => ({ default: m.AdminPortfolioPage })))
const ProjectEditor = lazy(() => import('./pages/admin/Portfolio/ProjectEditor').then(m => ({ default: m.ProjectEditor })))
const SettingsPage = lazy(() => import('./pages/admin/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })))
const AdminStreamsPage = lazy(() => import('./pages/admin/Streams/AdminStreamsPage').then(m => ({ default: m.AdminStreamsPage })))
const AdminPhotosPage = lazy(() => import('./pages/admin/Photos/AdminPhotosPage').then(m => ({ default: m.AdminPhotosPage })))
const AdminContactPage = lazy(() => import('./pages/admin/Contact/AdminContactPage').then(m => ({ default: m.AdminContactPage })))
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/Subscriptions/AdminSubscriptionsPage').then(m => ({ default: m.AdminSubscriptionsPage })))
const AdminFriendLinksPage = lazy(() => import('./pages/admin/FriendLinks/AdminFriendLinksPage').then(m => ({ default: m.AdminFriendLinksPage })))

/* ── Public layout wrapper ── */
function PublicLayout() {
  useVisitorTracker()
  return (
    <>
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  )
}

/* ── Admin layout wrapper ── */
function ProtectedAdminLayout() {
  return (
    <AuthGuard>
      <Suspense fallback={<PageLoader />}>
        <AdminLayout />
      </Suspense>
    </AuthGuard>
  )
}

export const router = createBrowserRouter(
  [
    {
      /* Public routes */
      element: <PublicLayout />,
      errorElement: <RouteErrorFallback />,
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/blog', element: <BlogPage /> },
        { path: '/blog/:slug', element: <BlogPostPage /> },
        { path: '/blog/tag/:slug', element: <BlogTagPage /> },
        { path: '/blog/series/:slug', element: <BlogSeriesPage /> },
        { path: '/portfolio', element: <PortfolioPage /> },
        { path: '/portfolio/:slug', element: <ProjectDetailPage /> },
        { path: '/photos', element: <PhotosPage /> },
        { path: '/visitantes', element: <VisitantesPage /> },
        { path: '/stream/:slug', element: <StreamRoomPage /> },
        { path: '/stream/:slug/cast', element: <CasterPage /> },
        { path: '/stream/:slug/watch', element: <ViewerPage /> },
        { path: '/contacto', element: <ContactPage /> },
      ],
    },
    {
      /* Login (no header/footer) */
      path: '/login',
      errorElement: <RouteErrorFallback />,
      element: (
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      ),
    },
    {
      /* Admin routes (behind AuthGuard) */
      path: '/admin',
      element: <ProtectedAdminLayout />,
      errorElement: <RouteErrorFallback />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'blog', element: <AdminBlogPage /> },
        { path: 'blog/new', element: <BlogEditor /> },
        { path: 'blog/:id', element: <BlogEditor /> },
        { path: 'blog/tags', element: <AdminTagsPage /> },
        { path: 'blog/series', element: <AdminSeriesPage /> },
        { path: 'portfolio', element: <AdminPortfolioPage /> },
        { path: 'portfolio/new', element: <ProjectEditor /> },
        { path: 'portfolio/:id', element: <ProjectEditor /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'streams', element: <AdminStreamsPage /> },
        { path: 'photos', element: <AdminPhotosPage /> },
        { path: 'contact', element: <AdminContactPage /> },
        { path: 'subscriptions', element: <AdminSubscriptionsPage /> },
        { path: 'links', element: <AdminFriendLinksPage /> },
      ],
    },
  ],
  {
    basename: '/hachimaki-dev',
  }
)
