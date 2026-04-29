import { describe, expect, it } from 'vitest'
import { normalizeModel, normalizeStyle } from '~/app/composables/useResumeDocumentState'

describe('resume document normalization', () => {
  it('clamps critical numeric bounds', () => {
    const style = normalizeStyle({
      asideWidth: 999,
      decorativeShapeA: { opacity: -2, rotation: 999 },
    }, 'aside-right')

    expect(style.asideWidth).toBe(380)
    expect(style.decorativeShapeA.opacity).toBe(0.05)
    expect(style.decorativeShapeA.rotation).toBe(180)
  })

  it('fallbacks to allowed variants for decorative shapes', () => {
    const style = normalizeStyle({
      decorativeShapeA: { type: 'triangle' },
      decorativeShapeB: { type: 'weird' },
    }, 'aside-right')

    expect(style.decorativeShapeA.type).toBe('circle')
    expect(style.decorativeShapeB.type).toBe('square')
  })

  it('migrates from partial or invalid objects', () => {
    const model = normalizeModel({
      style: {
        density: 'compact',
        decorativeShapeA: { opacity: 'bad' },
      },
      sectionOrder: [{ key: 'experience', region: 'main' }],
    }, 'modern')

    expect(model.style.density).toBe('compact')
    expect(model.style.decorativeShapeA.opacity).toBe(0.15)
    expect(model.sectionOrder).toHaveLength(8)
    expect(model.sectionOrder[0].key).toBe('experience')
    expect(model.sectionOrder[1].key).toBe('education')
  })
})
