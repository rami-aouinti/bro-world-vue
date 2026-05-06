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

for (const tpl of generatedCvTemplates) {
  const url = `${baseUrl}/resume/cv/preview?template=${encodeURIComponent(tpl.id)}`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.keyboard.press('Escape').catch(() => {})
  await page.addStyleTag({
    content: `
      .v-overlay-container,
      [role="dialog"],
      [aria-modal="true"],
      [class*="cookie"],
      [id*="cookie"],
      [class*="consent"],
      [id*="consent"] { display: none !important; visibility: hidden !important; }
    `,
  }).catch(() => {})

  const cvCanvas = page.locator('.cv-layout').first()
  await cvCanvas.waitFor({ state: 'visible' })
  const box = await cvCanvas.boundingBox()
  if (!box) {
    console.warn(`Skip ${tpl.id}: unable to resolve canvas bounds`)
    continue
  }

  await page.screenshot({
    path: path.join(outDir, `${tpl.id}.png`),
    clip: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: Math.min(1000, box.height),
    },
  })

  console.log(`Captured ${tpl.id}`)
}

await browser.close()
console.log(`✅ Captured ${generatedCvTemplates.length} templates in ${outDir}`)
