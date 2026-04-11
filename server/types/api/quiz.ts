import type { ApiObject } from './common'

export interface QuizCategory extends ApiObject {
  id: string
  value: string
  label: string
  description?: string | null
}

export interface QuizLevel extends ApiObject {
  id: string
  value: string
  label: string
  description?: string | null
}

export interface QuizAnswer extends ApiObject {
  id: string
  text: string
}

export interface QuizQuestion extends ApiObject {
  id: string
  category: string
  level: string
  question: string
  answers: QuizAnswer[]
}

export interface QuizSubmitAnswer extends ApiObject {
  questionId: string
  answerId: string
}

export interface QuizSubmitPayload extends ApiObject {
  answers: QuizSubmitAnswer[]
}

export type QuizSubmitApiResponse = ApiObject & {
  attemptId: string
  score: number
  passed: boolean
  totalQuestions: number
  correctAnswers: number
  percentage: number
  submittedAt?: string
}

export interface QuizLeaderboardItem extends ApiObject {
  rank: number
  userId: string
  username: string
  score: number
}

export type QuizCategoriesApiResponse = ApiObject & {
  items: QuizCategory[]
}

export type QuizLevelsApiResponse = ApiObject & {
  items: QuizLevel[]
}

export type QuizLeaderboardApiResponse = ApiObject & {
  items: QuizLeaderboardItem[]
}

export interface QuizPayload extends ApiObject {
  category?: string
  level?: string
  questions: QuizQuestion[]
}

export type QuizPublicApiResponse = QuizPayload
