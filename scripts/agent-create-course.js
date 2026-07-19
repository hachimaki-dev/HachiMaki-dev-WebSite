#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Simple .env parser since dotenv is not installed
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return {}
  
  const content = fs.readFileSync(envPath, 'utf8')
  const env = {}
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      env[match[1].trim()] = match[2].trim()
    }
  })
  return env
}

const env = loadEnv()
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY missing from .env')
  console.error('\n⚠️ ATENCIÓN: Necesitas la Service Role Key para bypasear RLS al crear cursos desde scripts.')
  console.error('Ve a Supabase Dashboard -> Settings -> API, copia la "service_role" key y ponla en tu .env como SUPABASE_SERVICE_ROLE_KEY=tu_clave')
  process.exit(1)
}

// Create client with service role key, bypassing RLS.
// Important: Disable auth session persistence so it doesn't mess with other stuff.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

async function main() {
  const fileArg = process.argv[2]

  if (!fileArg) {
    console.error('Usage: node scripts/agent-create-course.js <path-to-course-data.json>')
    console.error('The JSON file should contain: { title, description, category, difficulty, lessons: [{ title, excerpt, content, video_url }] }')
    process.exit(1)
  }

  const filePath = path.resolve(process.cwd(), fileArg)
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`)
    process.exit(1)
  }

  console.log(`Leyendo datos del curso desde: ${filePath}`)
  const rawData = fs.readFileSync(filePath, 'utf8')
  let courseData
  try {
    courseData = JSON.parse(rawData)
  } catch (err) {
    console.error('Error: Invalid JSON format.')
    process.exit(1)
  }

  const { title, description, category, difficulty, lessons = [] } = courseData

  if (!title) {
    console.error('Error: Course must have a title.')
    process.exit(1)
  }

  const courseSlug = slugify(title)

  console.log(`\nCreando/actualizando curso: "${title}"...`)

  // Check if course already exists
  const { data: existingCourse } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', courseSlug)
    .maybeSingle()

  let course

  if (existingCourse) {
    console.log(`El curso ya existe (ID: ${existingCourse.id}). Actualizando metadatos...`)
    const { data: updatedCourse, error: courseError } = await supabase
      .from('courses')
      .update({
        title,
        description: description || '',
        category: category || 'Tutorial',
        difficulty: difficulty || 'Principiante',
      })
      .eq('id', existingCourse.id)
      .select()
      .single()

    if (courseError) {
      console.error('Error actualizando curso:', courseError.message)
      process.exit(1)
    }
    course = updatedCourse
  } else {
    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert({
        title,
        slug: courseSlug,
        description: description || '',
        category: category || 'Tutorial',
        difficulty: difficulty || 'Principiante',
        published: false
      })
      .select()
      .single()

    if (courseError) {
      console.error('Error creando curso:', courseError.message)
      process.exit(1)
    }
    course = newCourse
    console.log(`✅ Curso creado con ID: ${course.id}`)
  }

  if (lessons.length > 0) {
    console.log(`\nProcesando ${lessons.length} lecciones...`)
    const activeSlugs = []
    
    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i]
      if (!l.title) {
        console.warn(`⚠️ Omitiendo lección ${i+1}: falta título`)
        continue
      }
      const lessonSlug = slugify(l.title)
      activeSlugs.push(lessonSlug)
      
      // Check if lesson already exists for this course
      const { data: existingLesson } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', course.id)
        .eq('slug', lessonSlug)
        .maybeSingle()

      if (existingLesson) {
        console.log(`- Actualizando lección: "${l.title}"`)
        const { error: lessonError } = await supabase
          .from('course_lessons')
          .update({
            title: l.title,
            excerpt: l.excerpt || '',
            content: l.content || 'Escribe aquí tu contenido...',
            video_url: l.video_url || null,
            sort_order: i
          })
          .eq('id', existingLesson.id)

        if (lessonError) {
          console.error(`Error al actualizar lección "${l.title}":`, lessonError.message)
        }
      } else {
        console.log(`- Creando lección: "${l.title}"`)
        const { error: lessonError } = await supabase
          .from('course_lessons')
          .insert({
            course_id: course.id,
            title: l.title,
            slug: lessonSlug,
            excerpt: l.excerpt || '',
            content: l.content || 'Escribe aquí tu contenido...',
            video_url: l.video_url || null,
            sort_order: i,
            published: false
          })

        if (lessonError) {
          console.error(`Error al crear lección "${l.title}":`, lessonError.message)
        }
      }
    }

    // Clean up obsolete lessons
    const { data: dbLessons } = await supabase
      .from('course_lessons')
      .select('id, slug')
      .eq('course_id', course.id)

    if (dbLessons) {
      const toDelete = dbLessons.filter(dbl => !activeSlugs.includes(dbl.slug))
      if (toDelete.length > 0) {
        console.log(`\nEliminando ${toDelete.length} lecciones obsoletas de la base de datos...`)
        for (const dbl of toDelete) {
          const { error: deleteError } = await supabase
            .from('course_lessons')
            .delete()
            .eq('id', dbl.id)
          if (deleteError) {
            console.error(`Error al eliminar lección obsoleta (slug: ${dbl.slug}):`, deleteError.message)
          } else {
            console.log(`- Lección obsoleta eliminada: ${dbl.slug}`)
          }
        }
      }
    }
  }

  console.log('\n🚀 Proceso completado con éxito.')
  console.log('Puedes revisar y publicar el curso desde el Panel de Administración: /admin/courses')
}

main()
