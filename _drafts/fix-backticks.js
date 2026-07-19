import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const partsDir = path.join(__dirname, 'ds-course-parts')

const files = fs.readdirSync(partsDir)
  .filter(f => f.startsWith('part-') && f.endsWith('.js'))
  .sort()

console.log(`Cleaning backslashes in ${files.length} files...`)

for (const file of files) {
  const filePath = path.join(partsDir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Replace triple backslash before backtick with single backslash
  content = content.replace(/\\{3}`/g, '\\`')
  
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`  Cleaned: ${file}`)
}

console.log('All files fixed!')
