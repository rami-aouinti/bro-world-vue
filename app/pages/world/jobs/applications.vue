<script setup lang="ts">
definePageMeta({ title: 'Jobs Applications' })

const jobsNavItems = [
  { title: 'Overview Jobs', to: '/world/jobs', icon: 'mdi-view-dashboard-outline' },
  { title: 'Offers', to: '/world/jobs/offers', icon: 'mdi-briefcase-outline' },
  { title: 'My Offers', to: '/world/jobs/my-offers', icon: 'mdi-account-tie-outline' },
  { title: 'Applications', to: '/world/jobs/applications', icon: 'mdi-file-document-outline' },
  { title: 'Apply', to: '/world/jobs/apply', icon: 'mdi-send-outline' },
  { title: 'Admin', to: '/world/jobs/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const rows = [
  { id: 'JB-1', title: 'Applications process A', owner: 'Talent Team', stage: 'Screening', status: 'Open' },
  { id: 'JB-2', title: 'Applications process B', owner: 'Hiring Manager', stage: 'Interview', status: 'Review' },
  { id: 'JB-3', title: 'Applications process C', owner: 'Recruiter', stage: 'Offer', status: 'Closed' },
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

    <v-container fluid class="pt-0">
      <WorldFeatureScaffold
        title="Jobs - Applications"
        subtitle="Pilotage métier de Applications avec formulaires structurés et données tabulaires."
        form-title="Create Applications record"
        form-description="Renseigne les infos RH pour préparer le workflow recrutement."
        :fields="[
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'owner', label: 'Owner', type: 'text' },
          { key: 'stage', label: 'Stage', type: 'select', options: [
            { title: 'Screening', value: 'screening' },
            { title: 'Interview', value: 'interview' },
            { title: 'Offer', value: 'offer' },
          ] },
          { key: 'priority', label: 'Priority', type: 'number' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Title', key: 'title' },
          { title: 'Owner', key: 'owner' },
          { title: 'Stage', key: 'stage' },
          { title: 'Status', key: 'status' },
        ]"
        :rows="rows"
        create-label="Save Applications"
      />
    </v-container>
  </div>
</template>
