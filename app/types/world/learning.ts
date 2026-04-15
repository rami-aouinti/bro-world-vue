import type {
  LearningAdminAnalyticsApiResponse,
  LearningCoursesApiResponse,
  LearningCoursesMutationPayload,
  LearningProgressApiResponse,
  LearningProgressMutationPayload,
} from '~~/server/types/api/learning'

export interface WorldPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface WorldLearningFilters {
  courseId?: string
  learner?: string
  cohort?: string
  status?: string
  q?: string
}

export interface WorldLearningListResponse<T> {
  items: T[]
}

export type WorldLearningCoursesListResponse = LearningCoursesApiResponse
export type WorldLearningProgressListResponse = LearningProgressApiResponse
export type WorldLearningAnalyticsDetailResponse =
  LearningAdminAnalyticsApiResponse
export type WorldLearningCourseMutationPayload = LearningCoursesMutationPayload
export type WorldLearningProgressMutationPayload =
  LearningProgressMutationPayload
