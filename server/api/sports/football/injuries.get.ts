import {
  fetchFixtureInjuries,
  getRequiredFootballId,
} from '../../../utils/footballApi'

export default defineEventHandler(async (event) => {
  const fixture = getRequiredFootballId(event, 'fixture')
  return fetchFixtureInjuries(event, fixture)
})
