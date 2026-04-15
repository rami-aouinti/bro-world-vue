<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Learning' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const learningNavItems = computed(() => [
  { title: 'Overview Learning', to: '/world/learning', icon: 'mdi-view-dashboard-outline' },
  { title: 'Courses', to: '/world/learning/courses', icon: 'mdi-book-open-page-variant-outline' },
  { title: 'Levels', to: '/world/learning/levels', icon: 'mdi-stairs' },
  { title: 'Paths', to: '/world/learning/paths', icon: 'mdi-map-marker-path' },
  ...(isRoot.value
    ? [{ title: 'Admin', to: '/world/learning/admin', icon: 'mdi-shield-crown-outline', rootOnly: true }]
    : []),
])

const rows = [
  { id: 'L-11', course: 'Frontend Foundations', level: 'Beginner', mentor: 'A. Kim', status: 'Open' },
  { id: 'L-22', course: 'Data Storytelling', level: 'Intermediate', mentor: 'M. Lopez', status: 'Live' },
  { id: 'L-33', course: 'Leadership Sprint', level: 'Advanced', mentor: 'J. Park', status: 'Planning' },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Plateforme LMS avec parcours par niveau et suivi apprenants."
      :nav-items="learningNavItems"
      action-label="Create course"
      action-icon="mdi-book-plus-outline"
    />

    <v-container fluid class="pt-0">
      <v-row class="mb-4">
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Active learners</p><h3 class="text-h5">2,430</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Course completion</p><h3 class="text-h5">73%</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Mentors online</p><h3 class="text-h5">18</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Certifications</p><h3 class="text-h5">412</h3></v-card></v-col>
      </v-row>

      <WorldFeatureScaffold
        title="Learning Hub"
        subtitle="Gestion complète des programmes, cohortes et progression par niveau."
        form-title="Create learning course"
        form-description="Ajoute un cours avec niveau, mentor et objectifs pédagogiques."
        :fields="[
          { key: 'title', label: 'Course title', type: 'text' },
          { key: 'mentor', label: 'Mentor', type: 'text' },
          { key: 'level', label: 'Level', type: 'select', options: [
            { title: 'Beginner', value: 'beginner' },
            { title: 'Intermediate', value: 'intermediate' },
            { title: 'Advanced', value: 'advanced' },
          ] },
          { key: 'duration', label: 'Duration (hours)', type: 'number' },
          { key: 'startDate', label: 'Start date', type: 'date' },
          { key: 'objectives', label: 'Objectives', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Course', key: 'course' },
          { title: 'Level', key: 'level' },
          { title: 'Mentor', key: 'mentor' },
          { title: 'Status', key: 'status' },
        ]"
        :rows="rows"
        create-label="Publish course"
      />
    </v-container>
  </div>
</template>
