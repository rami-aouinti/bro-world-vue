import { cachedPrivateGet } from '../../utils/privateApi'
import type { LibraryApiTreeResponse } from '../../types/api/library'

export default defineEventHandler(
  async (event): Promise<LibraryApiTreeResponse> => {
    return cachedPrivateGet<LibraryApiTreeResponse>(event, '/library/tree', {
      cacheDomain: 'library',
    })
  },
)
