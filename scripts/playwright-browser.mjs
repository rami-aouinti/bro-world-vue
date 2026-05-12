import { spawnSync } from 'node:child_process'

import { chromium } from 'playwright'

const missingBrowserPatterns = [
  "Executable doesn't exist",
  'Please run the following command to download new browsers',
]

const missingLibraryPatterns = [
  'libnspr4.so',
  'error while loading shared libraries',
]

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

function includesAny(message, patterns) {
  return patterns.some((pattern) => message.includes(pattern))
}

function installPlaywrightChromium() {
  console.warn(
    'Playwright Chromium is not installed. Running `pnpm exec playwright install chromium`...',
  )

  const result = spawnSync(
    'pnpm',
    ['exec', 'playwright', 'install', 'chromium'],
    {
      stdio: 'inherit',
    },
  )

  if (result.error) {
    throw new Error(
      `Unable to run pnpm exec playwright install chromium: ${result.error.message}`,
    )
  }

  if (result.status !== 0) {
    throw new Error(
      `pnpm exec playwright install chromium failed with exit code ${result.status}.`,
    )
  }
}

async function launchSystemChrome(options) {
  return chromium.launch({ ...options, channel: 'chrome' })
}

export async function launchChromium(options = {}) {
  const explicitPath = process.env.CHROMIUM_PATH
  if (explicitPath) {
    return chromium.launch({ ...options, executablePath: explicitPath })
  }

  try {
    return await chromium.launch(options)
  } catch (error) {
    const message = getErrorMessage(error)

    if (includesAny(message, missingBrowserPatterns)) {
      try {
        console.warn(
          'Playwright bundled Chromium is not installed, retrying with system Chrome channel...',
        )
        return await launchSystemChrome(options)
      } catch {
        installPlaywrightChromium()
        return chromium.launch(options)
      }
    }

    if (includesAny(message, missingLibraryPatterns)) {
      console.warn(
        'Playwright bundled Chromium is missing Linux system libs, retrying with system Chrome channel...',
      )
      return launchSystemChrome(options)
    }

    throw error
  }
}
