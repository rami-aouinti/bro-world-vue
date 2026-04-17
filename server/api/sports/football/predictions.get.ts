import { fetchFixturePrediction, getRequiredFootballId } from '../../../utils/footballApi'

export default defineEventHandler(async (event) => {
  const fixture = getRequiredFootballId(event, 'fixture')
  return fetchFixturePrediction(event, fixture)
})
