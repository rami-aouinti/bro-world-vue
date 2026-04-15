<script setup lang="ts">
import type { CrmAdminApiResponse } from '~~/server/types/api/crm'
import { CRM_PERMISSION_LABELS } from '~~/shared/crmAccess'
import { useCrmPermissions } from '~/composables/useCrmPermissions'

definePageMeta({ title: 'CRM Admin' })

const { can } = useCrmPermissions()

const crmNavItems = computed(() => [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  ...(can('crm.admin.manage')
    ? [{ title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' }]
    : []),
])

const { data: adminData } = await useAsyncData<CrmAdminApiResponse>(
  'crm-admin-policy',
  () => $fetch('/api/world/crm/admin'),
)

const policy = computed(() => adminData.value?.policy)
const roleMappings = computed(() => adminData.value?.roleMappings ?? [])
const auditLogs = computed(() => adminData.value?.auditLogs ?? [])
const currentUserPermissions = computed(() => adminData.value?.currentUserPermissions ?? [])

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Navigation CRM avec gestion des projets et entreprises."
      :nav-items="crmNavItems"
      action-label="Publish policy"
      action-icon="mdi-shield-check-outline"
    />

    <v-container fluid class="pt-0 d-flex flex-column ga-4">
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <h2 class="text-h5 mb-2">CRM Admin center</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Gestion des permissions fines et politiques de conformité CRM.
        </p>

        <v-alert type="info" variant="tonal" border="start" class="mb-4">
          Permissions courantes:
          <v-chip
            v-for="permission in currentUserPermissions"
            :key="permission"
            size="small"
            color="primary"
            variant="outlined"
            class="ml-2 mt-1"
          >
            {{ CRM_PERMISSION_LABELS[permission] || permission }}
          </v-chip>
        </v-alert>

        <v-row>
          <v-col cols="12" md="6">
            <v-switch
              label="Enforce lead assignment rules"
              color="primary"
              inset
              :model-value="policy?.enforceLeadAssignmentRules"
            />
            <v-switch
              label="Enable audit logs"
              color="primary"
              inset
              :model-value="policy?.enableAuditLogs"
            />
            <v-switch
              label="Require contract template"
              color="primary"
              inset
              :model-value="policy?.requireContractTemplate"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              label="Default SLA (hours)"
              type="number"
              variant="outlined"
              :model-value="policy?.defaultSlaHours"
            />
            <v-select
              label="Region policy"
              variant="outlined"
              :items="[
                { title: 'Global', value: 'global' },
                { title: 'EU only', value: 'eu' },
                { title: 'US only', value: 'us' },
              ]"
              :model-value="policy?.regionPolicy"
            />
            <v-btn color="primary" prepend-icon="mdi-content-save-outline" block>
              Save CRM policy
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-card rounded="xl" class="pa-5">
        <div class="d-flex justify-space-between align-center mb-3">
          <h3 class="text-h6 mb-0">Role → Permission mapping</h3>
          <v-chip color="primary" variant="tonal" size="small">Server-enforced</v-chip>
        </div>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Role</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mapping in roleMappings" :key="mapping.role">
              <td class="font-weight-medium">{{ mapping.role }}</td>
              <td>
                <v-chip
                  v-for="permission in mapping.permissions"
                  :key="`${mapping.role}-${permission}`"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  class="mr-2 mb-2"
                >
                  {{ CRM_PERMISSION_LABELS[permission] || permission }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card rounded="xl" class="pa-5">
        <h3 class="text-h6 mb-3">Audit log</h3>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in auditLogs" :key="entry.id">
              <td>{{ formatDateTime(entry.changedAt) }}</td>
              <td>{{ entry.actor }}</td>
              <td><v-chip size="small" color="primary" variant="tonal">{{ entry.action }}</v-chip></td>
              <td>{{ entry.targetType }} · {{ entry.targetId }}</td>
              <td>{{ entry.details }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-container>
  </div>
</template>
