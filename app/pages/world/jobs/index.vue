<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Jobs' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const jobsItems = computed(() => {
  const base = [
    { title: 'Offers', to: '/world/jobs/offers', icon: 'mdi-briefcase-outline' },
    { title: 'My Offers', to: '/world/jobs/my-offers', icon: 'mdi-account-tie-outline' },
    { title: 'Applications', to: '/world/jobs/applications', icon: 'mdi-file-document-outline' },
    { title: 'Apply', to: '/world/jobs/apply', icon: 'mdi-send-outline' },
  ]

  return isRoot.value
    ? [...base, { title: 'Admin', to: '/world/jobs/admin', icon: 'mdi-shield-crown-outline' }]
    : base
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-3">
      <v-card-title class="text-h5">Jobs</v-card-title>
      <v-row class="mt-2">
        <v-col v-for="item in jobsItems" :key="item.to" cols="12" sm="6">
          <v-card :to="item.to" rounded="lg" variant="tonal">
            <v-card-item>
              <template #prepend>
                <v-icon :icon="item.icon" class="mr-3" />
              </template>
              <v-card-title>{{ item.title }}</v-card-title>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
