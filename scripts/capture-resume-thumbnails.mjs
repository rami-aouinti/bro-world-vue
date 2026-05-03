import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import GENERATED_RESUME_TEMPLATES from '../app/data/resume-templates/generated-90.json' assert { type: 'json' }
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public/img/cv/generated')
const baseUrl = process.env.RESUME_CAPTURE_BASE_URL || 'http://127.0.0.1:3000'

await mkdir(outDir, { recursive: true })

const executablePath = process.env.CHROMIUM_PATH
if (!executablePath) throw new Error('Set CHROMIUM_PATH to a Chromium/Chrome executable path')
const browser = await chromium.launch({ headless: true, executablePath })
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } })

for (const tpl of GENERATED_RESUME_TEMPLATES) {
  const url = `${baseUrl}/resume/template-capture/${tpl.id}`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(outDir, `${tpl.id}.png`), fullPage: true })
  console.log(`Captured ${tpl.id}`)
}

await browser.close()
console.log(`✅ Captured ${GENERATED_RESUME_TEMPLATES.length} templates in ${outDir}`)
