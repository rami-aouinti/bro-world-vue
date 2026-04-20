export function useWorldLearningNavItems() {
  const { t } = useI18n()

  const learningNavItems = computed(() => [
    {
      title: t('world.learning.nav.exams', 'Exams'),
      to: '/world/learning/exams',
      icon: 'mdi-file-document-outline',
    },
    {
      title: t('world.learning.nav.classes', 'Classes'),
      to: '/world/learning/classes',
      icon: 'mdi-google-classroom',
    },
    {
      title: t('world.learning.nav.courses', 'Courses'),
      to: '/world/learning/courses',
      icon: 'mdi-book-open-variant',
    },
    {
      title: t('world.learning.nav.teachers', 'Teachers'),
      to: '/world/learning/teachers',
      icon: 'mdi-account-tie',
    },
    {
      title: t('world.learning.nav.students', 'Students'),
      to: '/world/learning/students',
      icon: 'mdi-account-school',
    },
    {
      title: t('world.learning.nav.grades', 'Grades'),
      to: '/world/learning/grades',
      icon: 'mdi-check-decagram-outline',
    },
    {
      title: t('world.learning.nav.admin', 'Admin'),
      to: '/world/learning/admin',
      icon: 'mdi-shield-crown-outline',
    },
  ])

  return {
    learningNavItems,
  }
}
