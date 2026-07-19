#!/usr/bin/env node
/**
 * Assembles all lesson parts from _drafts/ds-course-parts/ into a single course JSON.
 * Each part file exports an array of lesson objects: { title, excerpt, content }
 * Parts are loaded in alphabetical order (part-01.js, part-02.js, etc.)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const partsDir = path.join(__dirname, 'ds-course-parts')

async function main() {
  const files = fs.readdirSync(partsDir)
    .filter(f => f.startsWith('part-') && f.endsWith('.js'))
    .sort()

  console.log(`Found ${files.length} part files`)

  let allLessons = []
  for (const file of files) {
    const mod = await import(path.join(partsDir, file))
    const lessons = mod.default || mod.lessons
    if (Array.isArray(lessons)) {
      allLessons = allLessons.concat(lessons)
      console.log(`  ${file}: ${lessons.length} lessons`)
    }
  }

  const course = {
    title: "Datos y Visualización con Python",
    description: "Curso 2 de la serie IA desde Cero. Aprende a cargar, limpiar, explorar y visualizar datos reales con Pandas, Matplotlib y Seaborn. El paso esencial antes de entrenar cualquier modelo de Machine Learning.",
    category: "Ciencia de Datos",
    difficulty: "Principiante",
    lessons: allLessons
  }

  const outPath = path.join(__dirname, 'datos-y-visualizacion.json')
  fs.writeFileSync(outPath, JSON.stringify(course, null, 2), 'utf8')
  console.log(`\n✅ Course JSON written: ${outPath}`)
  console.log(`   Total lessons: ${allLessons.length}`)
}

main().catch(console.error)
