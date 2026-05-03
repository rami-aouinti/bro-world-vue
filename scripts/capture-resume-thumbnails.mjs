import { execSync } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public/img/cv/generated')
const templatesPath = path.join(root, 'app/data/resume-templates/generated-90.json')
const baseUrl = process.env.RESUME_CAPTURE_BASE_URL || 'http://127.0.0.1:3000'

const templatesRaw = await readFile(templatesPath, 'utf-8')
const generatedResumeTemplates = JSON.parse(templatesRaw)

await mkdir(outDir, { recursive: true })

let chromium
let hasPlaywrightPackage = false
try {
  ;({ chromium } = await import('playwright'))
  hasPlaywrightPackage = true
}
catch {
  ;({ chromium } = await import('playwright-core'))
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const browserMissing = message.includes("Executable doesn't exist")

    if (!browserMissing) throw error

    if (!hasPlaywrightPackage) {
      throw new Error('Playwright browser is missing and package "playwright" is not installed. Install playwright or provide CHROMIUM_PATH.')
    }

    console.log('Playwright browser missing. Installing chromium...')
    execSync('pnpm exec playwright install chromium', { stdio: 'inherit' })
    return chromium.launch({ headless: true })
  }
}

const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } })

for (const tpl of generatedResumeTemplates) {
  const url = `${baseUrl}/resume/template-capture/${tpl.id}`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(outDir, `${tpl.id}.png`), fullPage: true })
  console.log(`Captured ${tpl.id}`)
}

await browser.close()
console.log(`✅ Captured ${generatedResumeTemplates.length} templates in ${outDir}`)
