<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Jobs Admin' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const jobsNavItems = [
  { title: 'Overview Jobs', to: '/world/jobs', icon: 'mdi-view-dashboard-outline' },
  { title: 'Offers', to: '/world/jobs/offers', icon: 'mdi-briefcase-outline' },
  { title: 'My Offers', to: '/world/jobs/my-offers', icon: 'mdi-account-tie-outline' },
  { title: 'Applications', to: '/world/jobs/applications', icon: 'mdi-file-document-outline' },
  { title: 'Apply', to: '/world/jobs/apply', icon: 'mdi-send-outline' },
  { title: 'Admin', to: '/world/jobs/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Jobs"
      module-icon="mdi-briefcase-search-outline"
      module-description="Navigation complète du module Jobs."
      :nav-items="jobsNavItems"
      action-label="Apply admin policy"
      action-icon="mdi-shield-check-outline"
    />

    <v-container fluid class="pt-0">
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="isRoot">
          <h2 class="text-h5 mb-2">Jobs Admin center</h2>
          <p class="text-medium-emphasis mb-4">Configure pipeline de recrutement, conformité et accès recruteurs.</p>
          <v-row>
            <v-col cols="12" md="6">
              <v-switch label="Enable blind screening" color="primary" inset />
              <v-switch label="Require diversity review" color="primary" inset />
              <v-switch label="Auto-close stale offers" color="primary" inset />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field label="Offer expiration (days)" type="number" variant="outlined" />
              <v-select label="Default interview panel size" variant="outlined" :items="['2', '3', '4', '5']" />
              <v-btn color="primary" prepend-icon="mdi-content-save-outline" block>Save Hiring settings</v-btn>
            </v-col>
          </v-row>
        </template>
        <p v-else class="text-error mb-0">Access denied. This page requires ROLE_ROOT.</p>
      </v-card>
    </v-container>
  </div>
</template>
