import { defineEventHandler, setHeader } from 'h3'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const filePath = resolve(process.cwd(), 'public/sitemap.xml')
  const xml = await readFile(filePath, 'utf8')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
