import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { AdminLayout } from './components/layout/AdminLayout'
import { AuthGuard } from './features/auth/AuthGuard'
import { PageLoader } from './components/ui/PageLoader'

/* ── Lazy load pages ── */
const HomePage = lazy(() => import('./pages/public/Home/HomePage').then(m => ({ default: m.HomePage })))
const BlogPage = lazy(() => import('./pages/public/Blog/BlogPage').then(m => ({ default: m.BlogPage })))
const BlogPostPage = lazy(() => import('./pages/public/Blog/BlogPostPage').then(m => ({ default: m.BlogPostPage })))
const PortfolioPage = lazy(() => import('./pages/public/Portfolio/PortfolioPage').then(m => ({ default: m.PortfolioPage })))
const ProjectDetailPage = lazy(() => import('./pages/public/Portfolio/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })))
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })))

/* ── Streaming pages ── */
const StreamRoomPage = lazy(() => import('./pages/public/Stream/StreamRoomPage').then(m => ({ default: m.StreamRoomPage })))
const CasterPage = lazy(() => import('./pages/public/Stream/CasterPage').then(m => ({ default: m.CasterPage })))
const ViewerPage = lazy(() => import('./pages/public/Stream/ViewerPage').then(m => ({ default: m.ViewerPage })))

const DashboardPage = lazy(() => import('./pages/admin/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AdminBlogPage = lazy(() => import('./pages/admin/Blog/AdminBlogPage').then(m => ({ default: m.AdminBlogPage })))
const BlogEditor = lazy(() => import('./pages/admin/Blog/BlogEditor').then(m => ({ default: m.BlogEditor })))
const AdminPortfolioPage = lazy(() => import('./pages/admin/Portfolio/AdminPortfolioPage').then(m => ({ default: m.AdminPortfolioPage })))
const ProjectEditor = lazy(() => import('./pages/admin/Portfolio/ProjectEditor').then(m => ({ default: m.ProjectEditor })))
const SettingsPage = lazy(() => import('./pages/admin/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })))
const AdminStreamsPage = lazy(() => import('./pages/admin/Streams/AdminStreamsPage').then(m => ({ default: m.AdminStreamsPage })))

/* ── Public layout wrapper ── */
function PublicLayout() {
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
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/blog', element: <BlogPage /> },
        { path: '/blog/:slug', element: <BlogPostPage /> },
        { path: '/portfolio', element: <PortfolioPage /> },
        { path: '/portfolio/:slug', element: <ProjectDetailPage /> },
        { path: '/stream/:slug', element: <StreamRoomPage /> },
        { path: '/stream/:slug/cast', element: <CasterPage /> },
        { path: '/stream/:slug/watch', element: <ViewerPage /> },
      ],
    },
    {
      /* Login (no header/footer) */
      path: '/login',
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
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'blog', element: <AdminBlogPage /> },
        { path: 'blog/new', element: <BlogEditor /> },
        { path: 'blog/:id', element: <BlogEditor /> },
        { path: 'portfolio', element: <AdminPortfolioPage /> },
        { path: 'portfolio/new', element: <ProjectEditor /> },
        { path: 'portfolio/:id', element: <ProjectEditor /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'streams', element: <AdminStreamsPage /> },
      ],
    },
  ],
  {
    basename: '/hachimaki-dev',
  }
)
