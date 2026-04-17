import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { parse as parseSfc } from 'vue/compiler-sfc'
import { NodeTypes, parse as parseTemplate } from '@vue/compiler-dom'
import allowlist from './fixtures/i18n-literal-allowlist.json'

type Violation = {
  file: string
  kind: string
  text: string
}

const userFacingAttributes = new Set([
  'title',
  'label',
  'placeholder',
  'hint',
  'text',
  'subtitle',
  'aria-label',
])

const scopeRoots = ['app/pages/world', 'app/components']

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function hasUserLetters(text: string) {
  return /[A-Za-zÀ-ÿ]/.test(text)
}

function walkTemplate(node: any, file: string, violations: Violation[]) {
  if (node.type === NodeTypes.TEXT) {
    const text = normalizeText(node.content || '')
    if (text && hasUserLetters(text)) {
      violations.push({ file, kind: 'text', text })
    }
  }

  if (node.type === NodeTypes.ELEMENT) {
    for (const prop of node.props || []) {
      if (
        prop.type === NodeTypes.ATTRIBUTE &&
        userFacingAttributes.has(prop.name) &&
        prop.value?.content
      ) {
        const text = normalizeText(prop.value.content)
        if (text && hasUserLetters(text)) {
          violations.push({ file, kind: `attr:${prop.name}`, text })
        }
      }
    }
  }

  for (const child of node.children || []) {
    walkTemplate(child, file, violations)
  }

  for (const branch of node.branches || []) {
    for (const child of branch.children || []) {
      walkTemplate(child, file, violations)
    }
  }
}

function collectVueFiles() {
  const command = `${scopeRoots.join(' ')} -g '*.vue'`
  const output = execSync(`rg --files ${command}`, { encoding: 'utf8' }).trim()
  return output.split('\n').filter(Boolean)
}

function collectLiteralViolations() {
  const files = collectVueFiles()
  const violations: Violation[] = []

  for (const file of files) {
    const source = readFileSync(resolve(file), 'utf8')
    const sfc = parseSfc(source, { filename: file })
    const template = sfc.descriptor.template?.content
    if (!template) {
      continue
    }

    let ast: any
    try {
      ast = parseTemplate(template)
    } catch {
      continue
    }

    walkTemplate(ast, file, violations)
  }

  return Array.from(
    new Set(
      violations.map((entry) => `${entry.file}|${entry.kind}|${entry.text}`),
    ),
  ).sort()
}

describe('world i18n literal-string guard', () => {
  it('flags user-facing literal strings not wrapped in t()', () => {
    const knownLegacyLiterals = new Set(allowlist)
    const literals = collectLiteralViolations()
    const regressions = literals.filter(
      (entry) => !knownLegacyLiterals.has(entry),
    )

    expect(
      regressions,
      `Found new literal strings that should be translated with t():\n${regressions.join('\n')}`,
    ).toEqual([])
  })
})
