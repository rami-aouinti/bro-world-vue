import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

let chromium
try {
  ;({ chromium } = await import('playwright'))
}
catch {
  throw new Error('Missing dependency "playwright". Run: pnpm add -D playwright && pnpm exec playwright install chromium')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public/img/cv/generated')
const templatesPath = path.join(root, 'app/data/resume-templates/generated-20-resume.json')
const baseUrl = process.env.RESUME_CAPTURE_BASE_URL || 'http://127.0.0.1:3000'

const templatesRaw = await readFile(templatesPath, 'utf-8')
const generatedCvTemplates = JSON.parse(templatesRaw)

await mkdir(outDir, { recursive: true })

async function launchBrowser() {
  const explicitPath = process.env.CHROMIUM_PATH
  if (explicitPath) {
    return chromium.launch({ headless: true, executablePath: explicitPath })
  }

  try {
    return await chromium.launch({ headless: true })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.includes('libnspr4.so') || message.includes('error while loading shared libraries')) {
      console.warn('Playwright bundled Chromium is missing Linux system libs, retrying with system Chrome channel...')
      return chromium.launch({ headless: true, channel: 'chrome' })
    }

    throw error
  }
}

const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 1200, height: 1500 } })
const CAPTURE_MAX_HEIGHT = 820

for (const tpl of generatedCvTemplates) {
  const url = `${baseUrl}/resume/cv/preview?template=${encodeURIComponent(tpl.id)}&capture=1`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 })
  await page.keyboard.press('Escape').catch(() => {})

  const captureCanvas = page.locator('.cv-preview-page').first()
  await captureCanvas.waitFor({ state: 'visible', timeout: 60_000 })
  const box = await captureCanvas.boundingBox()
  if (!box) throw new Error(`Capture target not measurable for ${tpl.id}`)
  await page.screenshot({
    path: path.join(outDir, `${tpl.id}.png`),
    clip: {
      x: Math.max(0, box.x),
      y: Math.max(0, box.y),
      width: box.width,
      height: Math.min(box.height, CAPTURE_MAX_HEIGHT),
    },
  })

  console.log(`Captured ${tpl.id}`)
}

await browser.close()
console.log(`✅ Captured ${generatedCvTemplates.length} templates in ${outDir}`)
