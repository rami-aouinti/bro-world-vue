import { mutatingPrivateApiCall } from '../../utils/privateApi'
import type {
  QuizSubmitApiResponse,
  QuizSubmitPayload,
} from '~~/server/types/api/quiz'

export default defineEventHandler(
  async (event): Promise<QuizSubmitApiResponse> => {
    const body = await readBody<QuizSubmitPayload>(event)

    return mutatingPrivateApiCall<QuizSubmitApiResponse>(
      event,
      '/api/v1/quiz/general/submit',
      {
        mutationKey: 'quiz:submit',
        method: 'POST',
        body,
      },
    )
  },
)
