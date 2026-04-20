import { requireLearningAdmin } from '~~/server/utils/learningAdminAccess'
import { getSchoolSnapshot } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(async (event) => {
  await requireLearningAdmin(event)
  const snapshot = await getSchoolSnapshot(event)

  return {
    items: [
      { key: 'classes', label: 'Classes', count: snapshot.classes.length },
      { key: 'courses', label: 'Courses', count: snapshot.courses.length },
      { key: 'teachers', label: 'Teachers', count: snapshot.teachers.length },
      { key: 'students', label: 'Students', count: snapshot.students.length },
      { key: 'exams', label: 'Exams', count: snapshot.exams.length },
      { key: 'grades', label: 'Grades', count: snapshot.grades.length },
    ],
  }
})
