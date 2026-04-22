<script setup lang="ts">
import type { ApiListResponse, CrmContactItem } from '~~/server/types/api/crm-general'

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
definePageMeta({ layout: 'crm', title: 'CRM Contacts' })

const { data, pending, error } = await useFetch<ApiListResponse<CrmContactItem>>('/api/crm/general/contacts')
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.contacts.list.title', 'Contacts')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.contacts.list.title', 'Contacts')"
      action-icon="mdi-card-account-phone-outline"
    />
    <v-container fluid>
      <h1 class="text-h5 mb-4">{{ t('world.crm.contacts.list.title', 'Contacts') }}</h1>
      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.contacts.alerts.loadListError') }}</v-alert>
      <v-row v-else>
        <v-col v-for="contact in data?.items ?? []" :key="contact.id" cols="12" md="6" lg="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <p class="text-subtitle-1 mb-1">{{ contact.firstName }} {{ contact.lastName }}</p>
            <p class="text-body-2 mb-1">{{ contact.email }}</p>
            <p class="text-body-2 mb-3">{{ contact.jobTitle }}</p>
            <v-btn color="primary" variant="tonal" @click="router.push(`/world/crm/contacts/${contact.id}`)">{{ t('world.crm.contacts.actions.viewDetails') }}</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
