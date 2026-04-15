<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'CRM Admin' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const crmNavItems = [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  { title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]
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

    <v-container fluid class="pt-0">
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="isRoot">
          <h2 class="text-h5 mb-2">CRM Admin center</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Gestion des permissions, SLA et politiques de conformité CRM.
          </p>
          <v-row>
            <v-col cols="12" md="6">
              <v-switch label="Enforce lead assignment rules" color="primary" inset />
              <v-switch label="Enable audit logs" color="primary" inset />
              <v-switch label="Require contract template" color="primary" inset />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field label="Default SLA (hours)" type="number" variant="outlined" />
              <v-select
                label="Region policy"
                variant="outlined"
                :items="[
                  { title: 'Global', value: 'global' },
                  { title: 'EU only', value: 'eu' },
                  { title: 'US only', value: 'us' },
                ]"
              />
              <v-btn color="primary" prepend-icon="mdi-content-save-outline" block>
                Save CRM policy
              </v-btn>
            </v-col>
          </v-row>
        </template>
        <p v-else class="text-error mb-0">Access denied. This page requires ROLE_ROOT.</p>
      </v-card>
    </v-container>
  </div>
</template>
