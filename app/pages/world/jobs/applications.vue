<script setup lang="ts">
definePageMeta({ title: 'Jobs Applications' })

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
      action-label="Create Applications"
    />

    <v-container fluid>
      <JobsPipelineBoard
        context="applications"
        title="Jobs - Applications"
        subtitle="Suivi ATS des candidats avec scoring serveur et journal de transitions."
      />
    </v-container>
  </div>
</template>
