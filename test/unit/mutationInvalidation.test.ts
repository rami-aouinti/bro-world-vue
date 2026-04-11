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
})
