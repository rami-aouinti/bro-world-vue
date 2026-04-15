<script setup lang="ts">
definePageMeta({ title: 'Learning Courses' })

const learningNavItems = [
  { title: 'Overview Learning', to: '/world/learning', icon: 'mdi-view-dashboard-outline' },
  { title: 'Courses', to: '/world/learning/courses', icon: 'mdi-book-open-page-variant-outline' },
  { title: 'Levels', to: '/world/learning/levels', icon: 'mdi-stairs' },
  { title: 'Paths', to: '/world/learning/paths', icon: 'mdi-map-marker-path' },
  { title: 'Admin', to: '/world/learning/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const rows = [
  { id: 'LE-1', title: 'Courses item A', owner: 'Mentor Team', level: 'Beginner', status: 'Open' },
  { id: 'LE-2', title: 'Courses item B', owner: 'Academy Ops', level: 'Intermediate', status: 'Draft' },
  { id: 'LE-3', title: 'Courses item C', owner: 'Curriculum', level: 'Advanced', status: 'Live' },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Navigation complète du module Learning."
      :nav-items="learningNavItems"
      action-label="Create Courses"
    />

    <v-container fluid class="pt-0">
      <WorldFeatureScaffold
        title="Learning - Courses"
        subtitle="Pilotage de courses avec formulaires détaillés et état d’avancement."
        form-title="Create Courses"
        form-description="Renseigne les paramètres pédagogiques et objectifs du module."
        :fields="[
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'owner', label: 'Owner', type: 'text' },
          { key: 'level', label: 'Level', type: 'select', options: [
            { title: 'Beginner', value: 'beginner' },
            { title: 'Intermediate', value: 'intermediate' },
            { title: 'Advanced', value: 'advanced' },
          ] },
          { key: 'capacity', label: 'Capacity', type: 'number' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Title', key: 'title' },
          { title: 'Owner', key: 'owner' },
          { title: 'Level', key: 'level' },
          { title: 'Status', key: 'status' },
        ]"
        :rows="rows"
        create-label="Save Courses"
      />
    </v-container>
  </div>
</template>
