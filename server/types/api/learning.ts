export type LearningContentType = 'text' | 'video' | 'file'
export type LearningProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface LearningContentVersion {
  version: number
  payload: string
  note: string
  changedAt: string
}

export interface LearningContentBlock {
  id: string
  title: string
  type: LearningContentType
  currentVersion: number
  versions: LearningContentVersion[]
}

export interface LearningQuizQuestion {
  id: string
  prompt: string
  points: number
}

export interface LearningAssessment {
  id: string
  title: string
  gradingScale: 'points' | 'percent'
  passThreshold: number
  questions: LearningQuizQuestion[]
}

export interface LearningLesson {
  id: string
  title: string
  objective: string
  prerequisiteLessonIds: string[]
  contentBlocks: LearningContentBlock[]
  assessment?: LearningAssessment
}

export interface LearningModule {
  id: string
  title: string
  description: string
  lessons: LearningLesson[]
}

export interface LearningCourse {
  id: string
  title: string
  owner: string
  status: 'draft' | 'live'
  version: number
  createdAt: string
  updatedAt: string
  modules: LearningModule[]
}

export interface LearningProgress {
  id: string
  courseId: string
  learner: string
  lessonStatuses: Record<string, LearningProgressStatus>
  completedAssessments: string[]
  updatedAt: string
}

export interface LearningCoursesApiResponse {
  items: LearningCourse[]
}

export type LearningCoursesMutationPayload =
  | {
    action: 'createCourse'
    title: string
    owner: string
  }
  | {
    action: 'addModule'
    courseId: string
    title: string
    description?: string
  }
  | {
    action: 'addLesson'
    courseId: string
    moduleId: string
    title: string
    objective?: string
  }
  | {
    action: 'addAssessment'
    courseId: string
    moduleId: string
    lessonId: string
    title: string
    gradingScale: 'points' | 'percent'
    passThreshold: number
    questions: Array<{ prompt: string, points: number }>
  }
  | {
    action: 'addContentBlock'
    courseId: string
    moduleId: string
    lessonId: string
    title: string
    type: LearningContentType
    payload: string
    versionNote?: string
  }
  | {
    action: 'addContentVersion'
    courseId: string
    moduleId: string
    lessonId: string
    contentBlockId: string
    payload: string
    versionNote?: string
  }
  | {
    action: 'setPrerequisite'
    courseId: string
    moduleId: string
    lessonId: string
    prerequisiteLessonIds: string[]
  }

export interface LearningProgressApiResponse {
  items: LearningProgress[]
}

export interface LearningProgressMutationPayload {
  action: 'upsertProgress'
  courseId: string
  learner: string
  lessonId?: string
  status?: LearningProgressStatus
  assessmentId?: string
  assessmentCompleted?: boolean
}
