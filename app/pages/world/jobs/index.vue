<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Jobs' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const jobsNavItems = computed(() => [
  { title: 'Overview Jobs', to: '/world/jobs', icon: 'mdi-view-dashboard-outline' },
  { title: 'Offers', to: '/world/jobs/offers', icon: 'mdi-briefcase-outline' },
  { title: 'My Offers', to: '/world/jobs/my-offers', icon: 'mdi-account-tie-outline' },
  { title: 'Applications', to: '/world/jobs/applications', icon: 'mdi-file-document-outline' },
  { title: 'Apply', to: '/world/jobs/apply', icon: 'mdi-send-outline' },
  ...(isRoot.value
    ? [{ title: 'Admin', to: '/world/jobs/admin', icon: 'mdi-shield-crown-outline', rootOnly: true }]
    : []),
])

const rows = [
  { id: 'J-100', role: 'Senior Vue Engineer', team: 'Platform', applicants: 62, status: 'Open' },
  { id: 'J-101', role: 'Product Designer', team: 'Experience', applicants: 24, status: 'Interview' },
  { id: 'J-102', role: 'DevOps Specialist', team: 'Infra', applicants: 15, status: 'Closed' },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Jobs"
      module-icon="mdi-briefcase-search-outline"
      module-description="ATS complet: offres, candidatures, suivi pipeline recrutement."
      :nav-items="jobsNavItems"
      action-label="Publish new offer"
      action-icon="mdi-briefcase-plus-outline"
    />

    <v-container fluid class="pt-0">
      <v-row class="mb-4">
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Open offers</p><h3 class="text-h5">18</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">New applications</p><h3 class="text-h5">94</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Interviews this week</p><h3 class="text-h5">27</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Offer acceptance</p><h3 class="text-h5">68%</h3></v-card></v-col>
      </v-row>

      <WorldFeatureScaffold
        title="Hiring Command Center"
        subtitle="Gestion professionnelle des offres et candidatures comme un vrai ATS."
        form-title="Create job offer"
        form-description="Définis le poste, niveau, mode de travail et rémunération cible."
        :fields="[
          { key: 'title', label: 'Job title', type: 'text' },
          { key: 'department', label: 'Department', type: 'text' },
          { key: 'seniority', label: 'Seniority', type: 'select', options: [
            { title: 'Junior', value: 'junior' },
            { title: 'Mid', value: 'mid' },
            { title: 'Senior', value: 'senior' },
          ] },
          { key: 'salary', label: 'Salary (annual)', type: 'number' },
          { key: 'deadline', label: 'Application deadline', type: 'date' },
          { key: 'description', label: 'Role description', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Role', key: 'role' },
          { title: 'Team', key: 'team' },
          { title: 'Applicants', key: 'applicants' },
          { title: 'Status', key: 'status' },
        ]"
        :rows="rows"
        create-label="Publish offer"
      />
    </v-container>
  </div>
</template>
