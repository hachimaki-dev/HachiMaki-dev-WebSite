import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase credentials in .env. Sitemap generation skipped.')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const SITE_URL = 'https://hachimaki.dev/hachimaki-dev' // Base URL since it's hosted on GH pages

async function generateSitemap() {
  console.log('Generating sitemap...')

  const urls = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/blog', changefreq: 'weekly', priority: 0.9 },
    { url: '/portfolio', changefreq: 'monthly', priority: 0.8 },
    { url: '/cursos', changefreq: 'weekly', priority: 0.9 },
    { url: '/photos', changefreq: 'monthly', priority: 0.6 },
    { url: '/visitantes', changefreq: 'always', priority: 0.5 },
    { url: '/contacto', changefreq: 'monthly', priority: 0.5 },
    { url: '/nexus', changefreq: 'weekly', priority: 0.7 },
  ]

  try {
    // 1. Fetch published blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, published_at')
      .eq('published', true)

    if (posts) {
      posts.forEach(post => {
        urls.push({
          url: `/blog/${post.slug}`,
          lastmod: post.published_at,
          changefreq: 'monthly',
          priority: 0.7
        })
      })
    }

    // 2. Fetch published courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, slug, published_at')
      .eq('published', true)

    if (courses) {
      for (const course of courses) {
        urls.push({
          url: `/cursos/${course.slug}`,
          lastmod: course.published_at,
          changefreq: 'monthly',
          priority: 0.8
        })

        // Fetch lessons for this course
        const { data: lessons } = await supabase
          .from('course_lessons')
          .select('slug, published_at')
          .eq('course_id', course.id)
          .eq('published', true)

        if (lessons) {
          lessons.forEach(lesson => {
            urls.push({
              url: `/cursos/${course.slug}/${lesson.slug}`,
              lastmod: lesson.published_at,
              changefreq: 'monthly',
              priority: 0.7
            })
          })
        }
      }
    }

    // 3. Fetch published projects
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, created_at')
      .eq('published', true)

    if (projects) {
      projects.forEach(project => {
        urls.push({
          url: `/portfolio/${project.slug}`,
          lastmod: project.created_at,
          changefreq: 'monthly',
          priority: 0.6
        })
      })
    }

    // Build the XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(item => `  <url>
    <loc>${SITE_URL}${item.url === '/' ? '' : item.url}</loc>
${item.lastmod ? `    <lastmod>${new Date(item.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    // Write to public folder
    const publicDir = path.resolve(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir)
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
    console.log('✅ sitemap.xml generated successfully.')

    // Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt)
    console.log('✅ robots.txt generated successfully.')

  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
  }
}

generateSitemap()
