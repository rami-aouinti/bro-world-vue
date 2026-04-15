<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Learning Admin' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const learningNavItems = [
  { title: 'Overview Learning', to: '/world/learning', icon: 'mdi-view-dashboard-outline' },
  { title: 'Courses', to: '/world/learning/courses', icon: 'mdi-book-open-page-variant-outline' },
  { title: 'Levels', to: '/world/learning/levels', icon: 'mdi-stairs' },
  { title: 'Paths', to: '/world/learning/paths', icon: 'mdi-map-marker-path' },
  { title: 'Admin', to: '/world/learning/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Navigation complète du module Learning."
      :nav-items="learningNavItems"
      action-label="Publish learning policy"
      action-icon="mdi-shield-check-outline"
    />

    <v-container fluid class="pt-0">
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="isRoot">
          <h2 class="text-h5 mb-2">Learning Admin center</h2>
          <p class="text-medium-emphasis mb-4">Gère la qualité pédagogique, les certifications et les accès mentors.</p>
          <v-row>
            <v-col cols="12" md="6">
              <v-switch label="Mandatory assessment" color="primary" inset />
              <v-switch label="Enable proctoring mode" color="primary" inset />
              <v-switch label="Auto-issue certificates" color="primary" inset />
            </v-col>
            <v-col cols="12" md="6">
              <v-select label="Default grading scale" variant="outlined" :items="['A-F', '0-100', 'Pass/Fail']" />
              <v-text-field label="Certification expiry (months)" variant="outlined" type="number" />
              <v-btn color="primary" prepend-icon="mdi-content-save-outline" block>Save Learning settings</v-btn>
            </v-col>
          </v-row>
        </template>
        <p v-else class="text-error mb-0">Access denied. This page requires ROLE_ROOT.</p>
      </v-card>
    </v-container>
  </div>
</template>
