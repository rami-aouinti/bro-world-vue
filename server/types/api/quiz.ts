import type { ApiObject } from './common'

export interface QuizCategory extends ApiObject {
  slug: string
  name: string
  position?: number
  color: string
}

export interface QuizLevel extends ApiObject {
  value: string
  color: string
}

export interface QuizAnswer extends ApiObject {
  id: string
  label: string
  position?: number
}

export interface QuizQuestion extends ApiObject {
  id: string
  title: string
  category: string
  categoryColor?: string
  level: string
  levelColor?: string
  position?: number
  points?: number
  explanation?: string
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
  quizId?: string
  applicationSlug?: string
  passScore?: number
  score: number
  passed: boolean
  totalQuestions: number
  answeredQuestions?: number
  correctAnswers: number
  totalPoints?: number
  earnedPoints?: number
}

export interface QuizLeaderboardItem extends ApiObject {
  rank: number
  userId?: string
  username?: string
  score?: number
  weightedAverageScore?: number
  averageWeightedScore?: number
  avgWeightedScore?: number
  attempts?: number
  attemptCount?: number
  totalAttempts?: number
  profile?: {
    username?: string
    avatar?: string
    photo?: string
    avatarUrl?: string
  }
  avatar?: string
  photo?: string
  avatarUrl?: string
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
  id: string
  title: string
  description?: string
  passScore?: number
  isPublished?: boolean
  applicationSlug?: string
  configuration?: {
    shuffleQuestions?: boolean
    timerSec?: number
    showInstantCorrection?: boolean
  }
  category?: string
  level?: string
  questions: QuizQuestion[]
}

export type QuizPublicApiResponse = QuizPayload
