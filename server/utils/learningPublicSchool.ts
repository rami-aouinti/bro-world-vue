import type { H3Event } from 'h3'
import { getServerPublicAxios, resolveServerApiUrl } from './http/axiosClient'
import { getCached, invalidateByPrefix, setCached } from './apiCache'
import type {
  LearningCourse,
  LearningLesson,
  LearningModule,
  LearningProgress,
} from '~~/server/types/api/learning'

type PublicCollectionResponse<TItem> = {
  items: TItem[]
}

export type SchoolClass = {
  id: string
  name: string
  schoolId: string
}

export type SchoolTeacher = {
  id: string
  name: string
}

export type SchoolStudent = {
  id: string
  name: string
  classId: string
}

export type SchoolExam = {
  id: string
  title: string
  classId: string
  className?: string
  teacherId?: string
  teacherName?: string
  type?: string
  status?: string
  term?: string
  updatedAt?: string
}

export type SchoolGrade = {
  id: string
  score: number
  studentId: string
  examId: string
}

type SchoolSnapshot = {
  classes: SchoolClass[]
  students: SchoolStudent[]
  teachers: SchoolTeacher[]
  exams: SchoolExam[]
  grades: SchoolGrade[]
}

const SCHOOL_CACHE_PREFIX = 'learning:school:'
const SCHOOL_CACHE_TTL_SECONDS = 120

function scoreToStatus(score: number) {
  if (score >= 7) return 'completed' as const
  if (score > 0) return 'in_progress' as const
  return 'not_started' as const
}

function scoreToLevel(score: number) {
  if (score >= 8.5) return 'advanced' as const
  if (score >= 6.5) return 'intermediate' as const
  return 'beginner' as const
}

function buildLessonFromExam(exam: SchoolExam): LearningLesson {
  return {
    id: exam.id,
    title: exam.title,
    objective: exam.term ?? exam.type ?? 'Evaluation',
    prerequisiteLessonIds: [],
    contentBlocks: [],
    assessment: {
      id: exam.id,
      title: exam.title,
      gradingScale: 'points',
      passThreshold: 7,
      questions: [],
    },
  }
}

function mapClassesToCourses(
  classes: SchoolClass[],
  exams: SchoolExam[],
  teachersById: Map<string, string>,
): LearningCourse[] {
  return classes.map((schoolClass) => {
    const classExams = exams.filter((exam) => exam.classId === schoolClass.id)
    const modulesByTeacher = new Map<string, SchoolExam[]>()

    for (const exam of classExams) {
      const moduleKey = exam.teacherId ?? 'teacher-unassigned'
      const group = modulesByTeacher.get(moduleKey) ?? []
      group.push(exam)
      modulesByTeacher.set(moduleKey, group)
    }

    const modules: LearningModule[] = Array.from(modulesByTeacher.entries()).map(
      ([teacherId, teacherExams], index) => ({
        id: `${schoolClass.id}-module-${index + 1}`,
        title:
          teacherId === 'teacher-unassigned'
            ? 'Évaluations'
            : teachersById.get(teacherId) ?? 'Évaluations',
        description: `Exams for ${schoolClass.name}`,
        lessons: teacherExams.map(buildLessonFromExam),
      }),
    )

    return {
      id: schoolClass.id,
      title: schoolClass.name,
      owner: `School ${schoolClass.schoolId}`,
      status: classExams.some((exam) => exam.status === 'PUBLISHED')
        ? 'live'
        : 'draft',
      version: 1,
      createdAt: new Date(0).toISOString(),
      updatedAt:
        classExams
          .map((exam) => exam.updatedAt)
          .filter((entry): entry is string => Boolean(entry))
          .sort()
          .at(-1) ?? new Date().toISOString(),
      modules,
    }
  })
}

function mapGradesToProgress(snapshot: SchoolSnapshot): LearningProgress[] {
  const studentsById = new Map(snapshot.students.map((entry) => [entry.id, entry]))
  const gradesByStudent = new Map<string, SchoolGrade[]>()

  for (const grade of snapshot.grades) {
    const group = gradesByStudent.get(grade.studentId) ?? []
    group.push(grade)
    gradesByStudent.set(grade.studentId, group)
  }

  return Array.from(gradesByStudent.entries()).flatMap(([studentId, studentGrades]) => {
    const student = studentsById.get(studentId)
    if (!student) {
      return []
    }

    const lessonStatuses = Object.fromEntries(
      studentGrades.map((grade) => [grade.examId, scoreToStatus(grade.score)]),
    )
    const completedAssessments = studentGrades
      .filter((grade) => grade.score >= 7)
      .map((grade) => grade.examId)
    const totalScore = studentGrades.reduce((sum, grade) => sum + grade.score, 0)
    const averageScore = studentGrades.length > 0 ? totalScore / studentGrades.length : 0
    return [
      {
        id: `progress-${student.id}`,
        courseId: student.classId,
        learner: student.name,
        cohort: 'general',
        lessonStatuses,
        completedAssessments,
        score: Number(averageScore.toFixed(2)),
        timeSpentMinutes: studentGrades.length * 45,
        attempts: studentGrades.length,
        currentLevel: scoreToLevel(averageScore),
        unlockedLevels:
          averageScore >= 8.5
            ? ['beginner', 'intermediate', 'advanced']
            : averageScore >= 6.5
              ? ['beginner', 'intermediate']
              : ['beginner'],
        hasDroppedOut: false,
        updatedAt: new Date().toISOString(),
      },
    ]
  })
}

export async function getSchoolSnapshot(
  event: H3Event,
): Promise<SchoolSnapshot> {
  const [classes, students, teachers, exams, grades] = await Promise.all([
    fetchSchoolCollectionCached<SchoolClass>(event, 'classes'),
    fetchSchoolCollectionCached<SchoolStudent>(event, 'students'),
    fetchSchoolCollectionCached<SchoolTeacher>(event, 'teachers'),
    fetchSchoolCollectionCached<SchoolExam>(event, 'exams'),
    fetchSchoolCollectionCached<SchoolGrade>(event, 'grades'),
  ])

  return {
    classes,
    students,
    teachers,
    exams,
    grades,
  }
}

export async function getLearningCoursesFromSchool(
  event: H3Event,
): Promise<LearningCourse[]> {
  const snapshot = await getSchoolSnapshot(event)
  const teachersById = new Map(
    snapshot.teachers.map((teacher) => [teacher.id, teacher.name]),
  )
  return mapClassesToCourses(snapshot.classes, snapshot.exams, teachersById)
}

export async function getLearningProgressFromSchool(
  event: H3Event,
): Promise<LearningProgress[]> {
  const snapshot = await getSchoolSnapshot(event)
  return mapGradesToProgress(snapshot)
}

function getSchoolCollectionCacheKey(resource: string) {
  return `${SCHOOL_CACHE_PREFIX}${resource}`
}

async function fetchSchoolCollectionCached<TItem>(
  event: H3Event,
  resource: 'classes' | 'students' | 'teachers' | 'exams' | 'grades',
) {
  const cacheKey = getSchoolCollectionCacheKey(resource)
  const cached = await getCached<TItem[]>(cacheKey)
  if (cached) {
    return cached
  }

  const client = getServerPublicAxios(event)
  const response = await client.get<PublicCollectionResponse<TItem>>(
    resolveServerApiUrl(event, `/school/general/${resource}`),
  )
  const items = response.data.items ?? []
  await setCached(cacheKey, items, SCHOOL_CACHE_TTL_SECONDS)
  return items
}

export async function invalidateSchoolCache() {
  await invalidateByPrefix(SCHOOL_CACHE_PREFIX)
}

export async function listSchoolClasses(event: H3Event) {
  return fetchSchoolCollectionCached<SchoolClass>(event, 'classes')
}

export async function listSchoolTeachers(event: H3Event) {
  return fetchSchoolCollectionCached<SchoolTeacher>(event, 'teachers')
}

export async function listSchoolStudents(event: H3Event) {
  return fetchSchoolCollectionCached<SchoolStudent>(event, 'students')
}

export async function listSchoolExams(event: H3Event) {
  return fetchSchoolCollectionCached<SchoolExam>(event, 'exams')
}

export async function listSchoolGrades(event: H3Event) {
  return fetchSchoolCollectionCached<SchoolGrade>(event, 'grades')
}

export async function getSchoolClassById(event: H3Event, classId: string) {
  const client = getServerPublicAxios(event)
  const response = await client.get<SchoolClass>(
    resolveServerApiUrl(event, `/school/general/classes/${classId}`),
  )
  return response.data
}

export async function createSchoolClass(
  event: H3Event,
  payload: Pick<SchoolClass, 'name' | 'schoolId'>,
) {
  const client = getServerPublicAxios(event)
  const response = await client.post<SchoolClass>(
    resolveServerApiUrl(event, '/school/general/classes'),
    payload,
  )
  await invalidateSchoolCache()
  return response.data
}

export async function updateSchoolClass(
  event: H3Event,
  classId: string,
  payload: Partial<Pick<SchoolClass, 'name' | 'schoolId'>>,
) {
  const client = getServerPublicAxios(event)
  const response = await client.patch<SchoolClass>(
    resolveServerApiUrl(event, `/school/general/classes/${classId}`),
    payload,
  )
  await invalidateSchoolCache()
  return response.data
}

export async function deleteSchoolClass(event: H3Event, classId: string) {
  const client = getServerPublicAxios(event)
  await client.delete(resolveServerApiUrl(event, `/school/general/classes/${classId}`))
  await invalidateSchoolCache()
}
