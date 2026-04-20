import type { H3Event } from 'h3'
import { getServerPublicAxios, resolveServerApiUrl } from './http/axiosClient'
import type {
  LearningCourse,
  LearningLesson,
  LearningModule,
  LearningProgress,
} from '~~/server/types/api/learning'

type PublicCollectionResponse<TItem> = {
  items: TItem[]
}

type SchoolClass = {
  id: string
  name: string
  schoolId: string
}

type SchoolTeacher = {
  id: string
  name: string
}

type SchoolStudent = {
  id: string
  name: string
  classId: string
}

type SchoolExam = {
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

type SchoolGrade = {
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
  const examsById = new Map(snapshot.exams.map((entry) => [entry.id, entry]))
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
    const sortedExamIds = studentGrades
      .map((grade) => examsById.get(grade.examId))
      .filter((entry): entry is SchoolExam => Boolean(entry))
      .sort((left, right) =>
        (left.updatedAt ?? '').localeCompare(right.updatedAt ?? ''),
      )
      .map((entry) => entry.id)

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
  const client = getServerPublicAxios(event)
  const basePath = '/school/general'
  const [classes, students, teachers, exams, grades] = await Promise.all([
    client.get<PublicCollectionResponse<SchoolClass>>(
      resolveServerApiUrl(event, `${basePath}/classes`),
    ),
    client.get<PublicCollectionResponse<SchoolStudent>>(
      resolveServerApiUrl(event, `${basePath}/students`),
    ),
    client.get<PublicCollectionResponse<SchoolTeacher>>(
      resolveServerApiUrl(event, `${basePath}/teachers`),
    ),
    client.get<PublicCollectionResponse<SchoolExam>>(
      resolveServerApiUrl(event, `${basePath}/exams`),
    ),
    client.get<PublicCollectionResponse<SchoolGrade>>(
      resolveServerApiUrl(event, `${basePath}/grades`),
    ),
  ])

  return {
    classes: classes.data.items ?? [],
    students: students.data.items ?? [],
    teachers: teachers.data.items ?? [],
    exams: exams.data.items ?? [],
    grades: grades.data.items ?? [],
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
