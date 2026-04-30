import { describe, expect, it } from 'vitest'
import {
  extractSocialProfileImage,
  extractSocialProfileNames,
} from '../../server/utils/socialProfile'

describe('extractSocialProfileImage', () => {
  it('reads provider-specific picture fields', () => {
    expect(
      extractSocialProfileImage({ avatar_url: 'https://example.com/a.png' }),
    ).toBe('https://example.com/a.png')
    expect(
      extractSocialProfileImage({ picture: 'https://example.com/b.png' }),
    ).toBe('https://example.com/b.png')
  })
})

describe('extractSocialProfileNames', () => {
  it('uses explicit first and last name fields when available', () => {
    expect(
      extractSocialProfileNames({
        given_name: 'John',
        family_name: 'Doe',
      }),
    ).toEqual({ firstName: 'John', lastName: 'Doe' })
  })

  it('splits a full name with spaces', () => {
    expect(extractSocialProfileNames({ name: 'John Doe' })).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    })

    expect(
      extractSocialProfileNames({ name: 'John Ronald Reuel Tolkien' }),
    ).toEqual({
      firstName: 'John',
      lastName: 'Ronald Reuel Tolkien',
    })
  })

  it('supports single names and comma-separated names', () => {
    expect(extractSocialProfileNames({ name: 'Madonna' })).toEqual({
      firstName: 'Madonna',
      lastName: undefined,
    })

    expect(extractSocialProfileNames({ name: 'Doe, John' })).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    })
  })
})
