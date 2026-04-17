import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('../../app/utils/http/axiosClient', () => ({
  usePrivateAxios: () => ({
    request: requestMock,
  }),
}))

describe('privateApi.request', () => {
  let privateApi: typeof import('../../app/utils/http/privateApi').privateApi

  beforeAll(async () => {
    ;({ privateApi } = await import('../../app/utils/http/privateApi'))
  })

  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({ data: { ok: true } })
  })

  it('maps body to axios data payload', async () => {
    const payload = { type: 'like' }

    await privateApi.request('/api/v1/blog/private/posts/1/reactions', {
      method: 'POST',
      body: payload,
    })

    expect(requestMock).toHaveBeenCalledWith({
      url: '/api/v1/blog/private/posts/1/reactions',
      method: 'POST',
      data: payload,
    })
  })

  it('prefers data over body when both are provided', async () => {
    const body = { type: 'like' }
    const data = { type: 'heart' }

    await privateApi.request('/api/v1/blog/private/posts/1/reactions', {
      method: 'POST',
      body,
      data,
    })

    expect(requestMock).toHaveBeenCalledWith({
      url: '/api/v1/blog/private/posts/1/reactions',
      method: 'POST',
      data,
    })
  })
})
