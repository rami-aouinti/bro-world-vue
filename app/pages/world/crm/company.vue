<script setup lang="ts">
definePageMeta({ title: 'CRM Company' })

const crmNavItems = [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  { title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const rows = [
  { id: 'C-3001', company: 'Atlas Dynamics', industry: 'Fintech', owner: 'N. Park', health: 'Great' },
  { id: 'C-3002', company: 'Blue Harbor', industry: 'Retail', owner: 'M. Costa', health: 'At risk' },
  { id: 'C-3003', company: 'Kite Labs', industry: 'Education', owner: 'R. Silva', health: 'Stable' },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Navigation CRM avec gestion des projets et entreprises."
      :nav-items="crmNavItems"
      action-label="Add company"
      action-icon="mdi-domain-plus"
    />

    <v-container fluid class="pt-0">
      <WorldFeatureScaffold
        title="Company Accounts"
        subtitle="Gère les fiches sociétés, contacts clés et segmentation business."
        form-title="Create company profile"
        form-description="Ajoute une entreprise avec contact principal et catégorie."
        :fields="[
          { key: 'companyName', label: 'Company name', type: 'text' },
          { key: 'industry', label: 'Industry', type: 'text' },
          { key: 'contactEmail', label: 'Contact email', type: 'email' },
          { key: 'accountOwner', label: 'Account owner', type: 'text' },
          { key: 'employeeCount', label: 'Employees', type: 'number' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Company', key: 'company' },
          { title: 'Industry', key: 'industry' },
          { title: 'Owner', key: 'owner' },
          { title: 'Health', key: 'health' },
        ]"
        :rows="rows"
        create-label="Save company"
      />
    </v-container>
  </div>
</template>
