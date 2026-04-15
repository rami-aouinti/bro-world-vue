<script setup lang="ts">
definePageMeta({ title: 'CRM Projects' })

const crmNavItems = [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  { title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const rows = [
  { id: 'P-104', project: 'Migration B2B', manager: 'S. Ali', phase: 'Build', progress: '62%' },
  { id: 'P-108', project: 'Referral Automation', manager: 'E. Stone', phase: 'QA', progress: '81%' },
  { id: 'P-113', project: 'Contract Workspace', manager: 'J. Reid', phase: 'Design', progress: '29%' },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Navigation CRM avec gestion des projets et entreprises."
      :nav-items="crmNavItems"
      action-label="New project"
      action-icon="mdi-folder-plus-outline"
    />

    <v-container fluid class="pt-0">
      <WorldFeatureScaffold
        title="CRM Projects"
        subtitle="Planifie, assigne et suis l’avancement des projets clients."
        form-title="Create project"
        form-description="Configure timeline, manager, budget et priorité opérationnelle."
        :fields="[
          { key: 'name', label: 'Project name', type: 'text' },
          { key: 'manager', label: 'Project manager', type: 'text' },
          { key: 'priority', label: 'Priority', type: 'select', options: [
            { title: 'Low', value: 'low' },
            { title: 'Medium', value: 'medium' },
            { title: 'High', value: 'high' },
          ] },
          { key: 'startDate', label: 'Start date', type: 'date' },
          { key: 'budget', label: 'Budget', type: 'number' },
          { key: 'notes', label: 'Brief', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Project', key: 'project' },
          { title: 'Manager', key: 'manager' },
          { title: 'Phase', key: 'phase' },
          { title: 'Progress', key: 'progress' },
        ]"
        :rows="rows"
        create-label="Create project"
      />
    </v-container>
  </div>
</template>
