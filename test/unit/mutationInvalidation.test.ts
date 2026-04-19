import { describe, expect, it } from 'vitest'
import { getMutationInvalidationRules } from '../../server/utils/mutationInvalidation'

describe('mutation invalidation rules', () => {
  it('contains public quiz invalidation for submit mutation', () => {
    const rule = getMutationInvalidationRules().find(
      (entry) => entry.key === 'quiz:submit',
    )

    expect(rule).toEqual({
      key: 'quiz:submit',
      scope: 'public',
      prefixes: ['quiz'],
    })
  })

  it('contains private and public invalidation for blog comment reactions', () => {
    const rules = getMutationInvalidationRules().filter(
      (entry) => entry.key === 'blog:comments:reactions:create',
    )

    expect(rules).toEqual(
      expect.arrayContaining([
        {
          key: 'blog:comments:reactions:create',
          scope: 'private',
          prefixes: ['blog'],
        },
        {
          key: 'blog:comments:reactions:create',
          scope: 'public',
          prefixes: ['blog'],
        },
      ]),
    )
  })

  it('contains private invalidation for recruit resume mutations', () => {
    const rule = getMutationInvalidationRules().find(
      (entry) => entry.key === 'recruit-resumes',
    )

    expect(rule).toEqual({
      key: 'recruit-resumes',
      scope: 'private',
      prefixes: ['default'],
    })
  })
})
