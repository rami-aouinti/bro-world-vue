export function isMainGeneratedCvLayout(layout: string) {
  return ['aside', 'no-aside', 'no-aside-split'].includes(layout)
}

export function isSideGeneratedCvLayout(layout: string) {
  return [
    'aside-left',
    'aside-right',
    'aside-full-left',
    'aside-full-right',
    'aside-bar-left',
    'aside-bar-right',
    'aside-top-full-left',
    'aside-top-full-right',
    'identity-aside-left',
    'identity-aside-right',
    'pro-curve-left',
  ].includes(layout)
}
