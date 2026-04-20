<script setup lang="ts">
import type { CrmContactItem } from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const contactId = computed(() => String(route.params.contact ?? ''))

definePageMeta({ title: 'CRM Contact Detail' })

const { data, pending, error } = await useFetch<CrmContactItem>(() => `/api/crm/general/contacts/${contactId.value}`)
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.actions.createLead')"
      action-icon="mdi-account-plus-outline"
    >
      <template #right />
    </WorldModuleDrawers>
    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/contacts')">{{ t('world.crm.contactsDetail.actions.backToList') }}</v-btn>
      <CrmPageSkeleton v-if="pending" variant="detail" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.contactsDetail.alerts.notFound') }}</v-alert>
      <v-card v-else rounded="xl" class="pa-4 postcard-gradient-card">
        <h2 class="text-h6 mb-3">{{ data?.firstName }} {{ data?.lastName }}</h2>
        <p class="text-body-2 mb-1">{{ t('world.crm.contactsDetail.fields.email') }}: {{ data?.email }}</p>
        <p class="text-body-2 mb-1">{{ t('world.crm.contactsDetail.fields.phone') }}: {{ data?.phone }}</p>
        <p class="text-body-2 mb-1">{{ t('world.crm.contactsDetail.fields.city') }}: {{ data?.city }}</p>
        <p class="text-body-2 mb-0">{{ t('world.crm.contactsDetail.fields.score') }}: {{ data?.score }}</p>
      </v-card>
    </v-container>
  </div>
</template>
