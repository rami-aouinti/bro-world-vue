import type {
  LearningAssessment,
  LearningContentBlock,
  LearningCourse,
  LearningLesson,
  LearningModule,
  LearningProgress,
} from '~~/server/types/api/learning'

const COURSES_KEY = 'world:learning:courses'
const PROGRESS_KEY = 'world:learning:progress'

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const createSeedAssessment = (): LearningAssessment => ({
  id: createId('asm'),
  title: 'Intro Quiz',
  gradingScale: 'points',
  passThreshold: 70,
  questions: [
    { id: createId('q'), prompt: 'Quel est l’objectif principal du module ?', points: 10 },
    { id: createId('q'), prompt: 'Quelle activité valide la compréhension ?', points: 10 },
  ],
})

const createSeedLesson = (title: string, objective: string): LearningLesson => ({
  id: createId('les'),
  title,
  objective,
  prerequisiteLessonIds: [],
  contentBlocks: [
    {
      id: createId('cnt'),
      title: 'Introduction texte',
      type: 'text',
      currentVersion: 1,
      versions: [
        {
          version: 1,
          payload: `Contenu initial pour ${title}`,
          note: 'Version initiale',
          changedAt: new Date().toISOString(),
        },
      ],
    },
  ],
  assessment: createSeedAssessment(),
})

const createSeedCourse = (): LearningCourse => {
  const now = new Date().toISOString()
  return {
    id: createId('crs'),
    title: 'Course Blueprint - Product Academy',
    owner: 'Learning Ops',
    status: 'draft',
    version: 1,
    createdAt: now,
    updatedAt: now,
    modules: [
      {
        id: createId('mod'),
        title: 'Module 1 - Foundations',
        description: 'Bases pédagogiques du parcours',
        lessons: [
          createSeedLesson('Lesson 1 - Orientation', 'Comprendre les objectifs du cursus.'),
          createSeedLesson('Lesson 2 - Practice Lab', 'Mettre en pratique les concepts.'),
        ],
      },
    ],
  }
}

export const getLearningCoursesStorage = async (): Promise<LearningCourse[]> => {
  const storage = useStorage('data')
  const stored = await storage.getItem<LearningCourse[]>(COURSES_KEY)

  if (stored && Array.isArray(stored)) {
    return stored
  }

  const seeded = [createSeedCourse()]
  await storage.setItem(COURSES_KEY, seeded)

  return seeded
}

export const saveLearningCoursesStorage = async (courses: LearningCourse[]): Promise<void> => {
  const storage = useStorage('data')
  await storage.setItem(COURSES_KEY, courses)
}

export const getLearningProgressStorage = async (): Promise<LearningProgress[]> => {
  const storage = useStorage('data')
  const stored = await storage.getItem<LearningProgress[]>(PROGRESS_KEY)

  if (stored && Array.isArray(stored)) {
    return stored
  }

  await storage.setItem(PROGRESS_KEY, [])
  return []
}

export const saveLearningProgressStorage = async (progress: LearningProgress[]): Promise<void> => {
  const storage = useStorage('data')
  await storage.setItem(PROGRESS_KEY, progress)
}

export const findModuleInCourse = (course: LearningCourse, moduleId: string): LearningModule => {
  const module = course.modules.find((entry) => entry.id === moduleId)

  if (!module) {
    throw createError({ statusCode: 404, statusMessage: 'Learning module not found' })
  }

  return module
}

export const findLessonInModule = (module: LearningModule, lessonId: string): LearningLesson => {
  const lesson = module.lessons.find((entry) => entry.id === lessonId)

  if (!lesson) {
    throw createError({ statusCode: 404, statusMessage: 'Learning lesson not found' })
  }

  return lesson
}

export const findContentInLesson = (lesson: LearningLesson, contentBlockId: string): LearningContentBlock => {
  const contentBlock = lesson.contentBlocks.find((entry) => entry.id === contentBlockId)

  if (!contentBlock) {
    throw createError({ statusCode: 404, statusMessage: 'Learning content block not found' })
  }

  return contentBlock
}

export { createId }
