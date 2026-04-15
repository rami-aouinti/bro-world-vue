import type { LearningCourse, LearningCoursesApiResponse, LearningCoursesMutationPayload } from '~~/server/types/api/learning'
import {
  createId,
  findContentInLesson,
  findLessonInModule,
  findModuleInCourse,
  getLearningCoursesStorage,
  saveLearningCoursesStorage,
} from '~~/server/utils/learningStore'

const findCourse = (courses: LearningCourse[], courseId: string): LearningCourse => {
  const course = courses.find((entry) => entry.id === courseId)

  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Learning course not found' })
  }

  return course
}

export default defineEventHandler(async (event): Promise<LearningCoursesApiResponse> => {
  const body = await readBody<LearningCoursesMutationPayload>(event)
  const courses = await getLearningCoursesStorage()
  const now = new Date().toISOString()

  if (body.action === 'createCourse') {
    const createdCourse: LearningCourse = {
      id: createId('crs'),
      title: body.title.trim(),
      owner: body.owner.trim(),
      status: 'draft',
      version: 1,
      createdAt: now,
      updatedAt: now,
      modules: [],
    }

    const updatedCourses = [createdCourse, ...courses]
    await saveLearningCoursesStorage(updatedCourses)

    return { items: updatedCourses }
  }

  const course = findCourse(courses, body.courseId)

  if (body.action === 'addModule') {
    course.modules.push({
      id: createId('mod'),
      title: body.title.trim(),
      description: body.description?.trim() ?? '',
      lessons: [],
    })
  }

  if (body.action === 'addLesson') {
    const module = findModuleInCourse(course, body.moduleId)

    module.lessons.push({
      id: createId('les'),
      title: body.title.trim(),
      objective: body.objective?.trim() ?? '',
      prerequisiteLessonIds: [],
      contentBlocks: [],
    })
  }

  if (body.action === 'addAssessment') {
    const module = findModuleInCourse(course, body.moduleId)
    const lesson = findLessonInModule(module, body.lessonId)

    lesson.assessment = {
      id: createId('asm'),
      title: body.title.trim(),
      gradingScale: body.gradingScale,
      passThreshold: body.passThreshold,
      questions: body.questions.map((question) => ({
        id: createId('q'),
        prompt: question.prompt.trim(),
        points: question.points,
      })),
    }
  }

  if (body.action === 'addContentBlock') {
    const module = findModuleInCourse(course, body.moduleId)
    const lesson = findLessonInModule(module, body.lessonId)

    lesson.contentBlocks.push({
      id: createId('cnt'),
      title: body.title.trim(),
      type: body.type,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          payload: body.payload,
          note: body.versionNote?.trim() || 'Initial version',
          changedAt: now,
        },
      ],
    })
  }

  if (body.action === 'addContentVersion') {
    const module = findModuleInCourse(course, body.moduleId)
    const lesson = findLessonInModule(module, body.lessonId)
    const contentBlock = findContentInLesson(lesson, body.contentBlockId)
    const version = contentBlock.currentVersion + 1

    contentBlock.currentVersion = version
    contentBlock.versions.push({
      version,
      payload: body.payload,
      note: body.versionNote?.trim() || `Version ${version}`,
      changedAt: now,
    })
  }

  if (body.action === 'setPrerequisite') {
    const module = findModuleInCourse(course, body.moduleId)
    const lesson = findLessonInModule(module, body.lessonId)

    lesson.prerequisiteLessonIds = [...new Set(body.prerequisiteLessonIds.filter((id) => id !== lesson.id))]
  }

  course.version += 1
  course.updatedAt = now

  await saveLearningCoursesStorage(courses)

  return { items: courses }
})
