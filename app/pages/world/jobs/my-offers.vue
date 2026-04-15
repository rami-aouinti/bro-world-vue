<script setup lang="ts">
definePageMeta({ title: 'Jobs My Offers' })

const jobsNavItems = [
  {
    title: 'Overview Jobs',
    to: '/world/jobs',
    icon: 'mdi-view-dashboard-outline',
  },
  { title: 'Offers', to: '/world/jobs/offers', icon: 'mdi-briefcase-outline' },
  {
    title: 'My Offers',
    to: '/world/jobs/my-offers',
    icon: 'mdi-account-tie-outline',
  },
  {
    title: 'Applications',
    to: '/world/jobs/applications',
    icon: 'mdi-file-document-outline',
  },
  { title: 'Apply', to: '/world/jobs/apply', icon: 'mdi-send-outline' },
  {
    title: 'Admin',
    to: '/world/jobs/admin',
    icon: 'mdi-shield-crown-outline',
    rootOnly: true,
  },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Jobs"
      module-icon="mdi-briefcase-search-outline"
      module-description="Navigation complète du module Jobs."
      :nav-items="jobsNavItems"
      action-label="Create My Offers"
    />

    <v-container fluid>
      <JobsPipelineBoard
        context="my-offers"
        title="Jobs - My Offers"
        subtitle="Pilotage des candidatures avec étapes ATS normalisées et feedback consolidé."
      />
    </v-container>
  </div>
</template>
