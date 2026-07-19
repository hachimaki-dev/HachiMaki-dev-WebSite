#!/usr/bin/env node
/**
 * Assembles all lesson parts from _drafts/ai-course-parts/ into a single course JSON.
 * Each part file exports an array of lesson objects: { title, excerpt, content }
 * Parts are loaded in alphabetical order (part-01.js, part-02.js, etc.)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const partsDir = path.join(__dirname, 'ai-course-parts')

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
    title: "Inteligencia Artificial desde Cero",
    description: "Curso universitario progresivo de IA, Machine Learning y Deep Learning. Cada lección introduce exactamente un concepto nuevo con explicaciones intuitivas, código ejecutable, experimentos guiados y desafíos prácticos. De cero a construir modelos reales en PyTorch.",
    category: "Inteligencia Artificial",
    difficulty: "Principiante → Avanzado",
    lessons: allLessons
  }

  const outPath = path.join(__dirname, 'ia-desde-cero.json')
  fs.writeFileSync(outPath, JSON.stringify(course, null, 2), 'utf8')
  console.log(`\n✅ Course JSON written: ${outPath}`)
  console.log(`   Total lessons: ${allLessons.length}`)
}

main().catch(console.error)
