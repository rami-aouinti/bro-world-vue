import {
  cachedFixtureDetails,
  getRequiredFootballId,
} from '../../../utils/footballApi'
import type { FootballFixtureDetailsApiResponse } from '~~/server/types/api/football'

export default defineEventHandler(
  async (event): Promise<FootballFixtureDetailsApiResponse> => {
    const fixture = getRequiredFootballId(event, 'fixture')
    return cachedFixtureDetails(event, fixture)
  },
)
