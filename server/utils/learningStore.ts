import { createHash } from 'node:crypto'
import type {
  LearningAdminAnalytics,
  LearningAssessment,
  LearningContentBlock,
  LearningCourse,
  LearningCohortAnalytics,
  LearningLesson,
  LearningLevel,
  LearningModule,
  LearningLevelRule,
  LearningProgress,
} from '~~/server/types/api/learning'

const COURSES_KEY = 'world:learning:courses'
const PROGRESS_KEY = 'world:learning:progress'

const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`

export const LEARNING_LEVEL_RULES: LearningLevelRule[] = [
  {
    level: 'beginner',
    minScore: 0,
    minCompletedLessonsRatio: 0,
    maxAttempts: 99,
    minTimeSpentMinutes: 0,
    unlocks: ['intermediate'],
  },
  {
    level: 'intermediate',
    minScore: 70,
    minCompletedLessonsRatio: 0.5,
    maxAttempts: 6,
    minTimeSpentMinutes: 60,
    unlocks: ['advanced'],
  },
  {
    level: 'advanced',
    minScore: 85,
    minCompletedLessonsRatio: 1,
    maxAttempts: 4,
    minTimeSpentMinutes: 180,
    unlocks: [],
  },
]

const createSeedAssessment = (): LearningAssessment => ({
  id: createId('asm'),
  title: 'Intro Quiz',
  gradingScale: 'points',
  passThreshold: 70,
  questions: [
    {
      id: createId('q'),
      prompt: 'Quel est l’objectif principal du module ?',
      points: 10,
    },
    {
      id: createId('q'),
      prompt: 'Quelle activité valide la compréhension ?',
      points: 10,
    },
  ],
})

const createSeedLesson = (
  title: string,
  objective: string,
): LearningLesson => ({
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
          createSeedLesson(
            'Lesson 1 - Orientation',
            'Comprendre les objectifs du cursus.',
          ),
          createSeedLesson(
            'Lesson 2 - Practice Lab',
            'Mettre en pratique les concepts.',
          ),
        ],
      },
    ],
  }
}

export const getLearningCoursesStorage = async (): Promise<
  LearningCourse[]
> => {
  const storage = useStorage('data')
  const stored = await storage.getItem<LearningCourse[]>(COURSES_KEY)

  if (stored && Array.isArray(stored)) {
    return stored
  }

  const seeded = [createSeedCourse()]
  await storage.setItem(COURSES_KEY, seeded)

  return seeded
}

export const saveLearningCoursesStorage = async (
  courses: LearningCourse[],
): Promise<void> => {
  const storage = useStorage('data')
  await storage.setItem(COURSES_KEY, courses)
}

export const getLearningProgressStorage = async (): Promise<
  LearningProgress[]
> => {
  const storage = useStorage('data')
  const stored = await storage.getItem<LearningProgress[]>(PROGRESS_KEY)

  if (stored && Array.isArray(stored)) {
    return stored
  }

  await storage.setItem(PROGRESS_KEY, [])
  return []
}

export const saveLearningProgressStorage = async (
  progress: LearningProgress[],
): Promise<void> => {
  const storage = useStorage('data')
  await storage.setItem(PROGRESS_KEY, progress)
}

export const findModuleInCourse = (
  course: LearningCourse,
  moduleId: string,
): LearningModule => {
  const module = course.modules.find((entry) => entry.id === moduleId)

  if (!module) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Learning module not found',
    })
  }

  return module
}

export const findLessonInModule = (
  module: LearningModule,
  lessonId: string,
): LearningLesson => {
  const lesson = module.lessons.find((entry) => entry.id === lessonId)

  if (!lesson) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Learning lesson not found',
    })
  }

  return lesson
}

export const findContentInLesson = (
  lesson: LearningLesson,
  contentBlockId: string,
): LearningContentBlock => {
  const contentBlock = lesson.contentBlocks.find(
    (entry) => entry.id === contentBlockId,
  )

  if (!contentBlock) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Learning content block not found',
    })
  }

  return contentBlock
}

const getCompletedLessonRatio = (
  course: LearningCourse,
  progress: LearningProgress,
): number => {
  const totalLessons = course.modules.reduce(
    (count, module) => count + module.lessons.length,
    0,
  )
  if (totalLessons === 0) {
    return 0
  }

  const completed = Object.values(progress.lessonStatuses).filter(
    (status) => status === 'completed',
  ).length
  return completed / totalLessons
}

const renderSimplePdfBase64 = (
  verificationId: string,
  learner: string,
  courseTitle: string,
  issuedAt: string,
): string => {
  const content = [
    '%PDF-1.1',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj',
    `4 0 obj << /Length ${`BT /F1 16 Tf 72 700 Td (Certificate ${verificationId}) Tj 0 -24 Td (Learner: ${learner}) Tj 0 -24 Td (Course: ${courseTitle}) Tj 0 -24 Td (Issued: ${issuedAt}) Tj ET`.length} >> stream`,
    `BT /F1 16 Tf 72 700 Td (Certificate ${verificationId}) Tj 0 -24 Td (Learner: ${learner}) Tj 0 -24 Td (Course: ${courseTitle}) Tj 0 -24 Td (Issued: ${issuedAt}) Tj ET`,
    'endstream endobj',
    'xref 0 5',
    '0000000000 65535 f ',
    '0000000010 00000 n ',
    '0000000062 00000 n ',
    '0000000116 00000 n ',
    '0000000228 00000 n ',
    'trailer << /Size 5 /Root 1 0 R >>',
    'startxref',
    '420',
    '%%EOF',
  ].join('\n')

  return Buffer.from(content, 'utf-8').toString('base64')
}

export const evaluateProgressRules = (
  course: LearningCourse,
  progress: LearningProgress,
): LearningProgress => {
  const ratio = getCompletedLessonRatio(course, progress)
  const eligibleLevels = LEARNING_LEVEL_RULES.filter(
    (rule) =>
      progress.score >= rule.minScore &&
      ratio >= rule.minCompletedLessonsRatio &&
      progress.attempts <= rule.maxAttempts &&
      progress.timeSpentMinutes >= rule.minTimeSpentMinutes,
  ).map((rule) => rule.level)

  const currentLevel: LearningLevel = eligibleLevels.includes('advanced')
    ? 'advanced'
    : eligibleLevels.includes('intermediate')
      ? 'intermediate'
      : 'beginner'

  progress.currentLevel = currentLevel
  progress.unlockedLevels = Array.from(
    new Set(['beginner', ...eligibleLevels]),
  ) as LearningLevel[]
  progress.hasDroppedOut = progress.attempts >= 8 && ratio < 0.5

  if (currentLevel === 'advanced' && !progress.certificate) {
    const issuedAt = new Date().toISOString()
    const verificationId = createId('cert')
    const source = `${verificationId}|${progress.learner}|${course.id}|${progress.score}|${issuedAt}`

    progress.certificate = {
      verificationId,
      hash: createHash('sha256').update(source).digest('hex'),
      pdfBase64: renderSimplePdfBase64(
        verificationId,
        progress.learner,
        course.title,
        issuedAt,
      ),
      issuedAt,
    }
  }

  return progress
}

export const buildLearningAdminAnalytics = (
  progressItems: LearningProgress[],
): LearningAdminAnalytics => {
  const totalLearners = progressItems.length
  if (!totalLearners) {
    return {
      totalLearners: 0,
      completionRate: 0,
      dropoutRate: 0,
      averageScore: 0,
      cohortPerformance: [],
      levelRules: LEARNING_LEVEL_RULES,
    }
  }

  const completed = progressItems.filter(
    (entry) => entry.currentLevel === 'advanced',
  ).length
  const dropped = progressItems.filter((entry) => entry.hasDroppedOut).length
  const averageScore =
    progressItems.reduce((sum, entry) => sum + entry.score, 0) / totalLearners

  const byCohort = progressItems.reduce<Record<string, LearningProgress[]>>(
    (acc, entry) => {
      const key = entry.cohort || 'unassigned'
      acc[key] = acc[key] ?? []
      acc[key].push(entry)
      return acc
    },
    {},
  )

  const cohortPerformance: LearningCohortAnalytics[] = Object.entries(byCohort)
    .map(([cohort, entries]) => {
      const learnerCount = entries.length
      return {
        cohort,
        learners: learnerCount,
        completionRate: learnerCount
          ? Number(
              (
                (entries.filter((entry) => entry.currentLevel === 'advanced')
                  .length /
                  learnerCount) *
                100
              ).toFixed(1),
            )
          : 0,
        dropoutRate: learnerCount
          ? Number(
              (
                (entries.filter((entry) => entry.hasDroppedOut).length /
                  learnerCount) *
                100
              ).toFixed(1),
            )
          : 0,
        averageScore: learnerCount
          ? Number(
              (
                entries.reduce((sum, entry) => sum + entry.score, 0) /
                learnerCount
              ).toFixed(1),
            )
          : 0,
      }
    })
    .sort((left, right) => right.learners - left.learners)

  return {
    totalLearners,
    completionRate: Number(((completed / totalLearners) * 100).toFixed(1)),
    dropoutRate: Number(((dropped / totalLearners) * 100).toFixed(1)),
    averageScore: Number(averageScore.toFixed(1)),
    cohortPerformance,
    levelRules: LEARNING_LEVEL_RULES,
  }
}

export { createId }
