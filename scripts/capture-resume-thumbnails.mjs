import { access, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public/img/cv/generated')
const templatesPath = path.join(root, 'app/data/resume-templates/generated-90.json')
const baseUrl = process.env.RESUME_CAPTURE_BASE_URL || 'http://127.0.0.1:3000'

const templatesRaw = await readFile(templatesPath, 'utf-8')
const generatedResumeTemplates = JSON.parse(templatesRaw)

await mkdir(outDir, { recursive: true })

async function resolveBrowserPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH

  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
  ]

  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    }
    catch {
      // try next path
    }
  }

  return null
}

const executablePath = await resolveBrowserPath()
if (!executablePath) {
  console.error('❌ Unable to locate Chrome/Chromium automatically.')
  console.error('Set CHROMIUM_PATH, for example:')
  console.error('CHROMIUM_PATH=/usr/bin/google-chrome pnpm run capture:resume-thumbnails')
  process.exit(1)
}

const browser = await chromium.launch({ headless: true, executablePath })
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } })

for (const tpl of generatedResumeTemplates) {
  const url = `${baseUrl}/resume/template-capture/${tpl.id}`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(outDir, `${tpl.id}.png`), fullPage: true })
  console.log(`Captured ${tpl.id}`)
}

await browser.close()
console.log(`✅ Captured ${generatedResumeTemplates.length} templates in ${outDir}`)
