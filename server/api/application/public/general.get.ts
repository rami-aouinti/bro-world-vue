import { cachedPublicGet } from '../../../utils/publicApi'

type PublicGeneralApplicationItem = {
  title?: string
  photo?: string
  platform?: {
    key?: string
    name?: string
  }
}

type PublicGeneralApplicationResponse = {
  items?: PublicGeneralApplicationItem[]
}

export default defineEventHandler(
  async (event): Promise<PublicGeneralApplicationResponse> => {
    return cachedPublicGet<PublicGeneralApplicationResponse>(
      event,
      '/application/public/general',
      {
        cacheDomain: 'application',
      },
    )
  },
)
