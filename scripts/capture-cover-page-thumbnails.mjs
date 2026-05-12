import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchChromium } from './playwright-browser.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public/img/cv/generated')
const templatesPath = path.join(
  root,
  'app/data/resume-templates/generated-20-cover-page.json',
)
const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:3000'

const templatesRaw = await readFile(templatesPath, 'utf-8')
const generatedCoverPageTemplates = JSON.parse(templatesRaw)

await mkdir(outDir, { recursive: true })

const browser = await launchChromium({ headless: true })
const page = await browser.newPage({ viewport: { width: 794, height: 1000 } })

for (const tpl of generatedCoverPageTemplates) {
  const url = `${baseUrl}/resume/template-capture/cover-page/${tpl.id}`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.screenshot({
    path: path.join(outDir, `${tpl.id}.png`),
    fullPage: true,
  })
  console.log(`Captured ${tpl.id}`)
}

await browser.close()
console.log(
  `✅ Captured ${generatedCoverPageTemplates.length} templates in ${outDir}`,
)
