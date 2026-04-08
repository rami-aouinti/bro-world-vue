<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'

const { t } = useI18n()

definePageMeta({
  icon: 'mdi-security',
  title: 'appbar.auth',
  drawerIndex: 4,
  middleware: 'auth',
})

const headers: DataTableHeader[] = [
  { title: t('table.headers.id'), key: 'id' },
  { title: t('table.headers.name'), key: 'name' },
  { title: t('table.headers.title'), key: 'title' },
  { title: t('table.headers.email'), key: 'email' },
  { title: t('table.headers.role'), key: 'role' },
  { title: t('table.headers.actions'), key: 'actions' },
]

const { data: people } = await useFetch('/api/people')

const { loggedIn } = useUserSession()
watch(loggedIn, () => {
  if (!loggedIn.value) {
    navigateTo('/')
  }
})
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-data-table
            :items="people || undefined"
            :headers="headers"
            show-select
          >
            <template #item.role="{ item }">
              <v-chip>{{ item.role }}</v-chip>
            </template>
            <template #item.actions>
              <v-defaults-provider
                :defaults="{
                  VBtn: {
                    size: 20,
                    rounded: 'lg',
                    variant: 'text',
                    class: 'ml-1',
                    color: '',
                  },
                  VIcon: {
                    size: 20,
                  },
                  VTooltip: {
                    location: 'top',
                  },
                }"
              >
                <v-btn
                  v-tooltip="{ text: t('common.edit') }"
                  icon="mdi-pencil"
                  :aria-label="t('common.edit')"
                />
                <v-btn
                  v-tooltip="{ text: t('common.copy') }"
                  icon="mdi-content-copy"
                  :aria-label="t('common.copy')"
                />
                <v-btn
                  v-tooltip="{ text: t('common.delete') }"
                  icon="mdi-delete"
                  :aria-label="t('common.delete')"
                />
              </v-defaults-provider>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
