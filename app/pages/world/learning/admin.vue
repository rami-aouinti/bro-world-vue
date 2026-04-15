<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Learning Admin' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-4">
      <h2 class="text-h5 mb-2">Learning - Admin</h2>
      <p v-if="isRoot" class="text-medium-emphasis mb-0">
        Learning admin area with content grouped by level and progression.
      </p>
      <p v-else class="text-error mb-0">Access denied. This page requires ROLE_ROOT.</p>
    </v-card>
  </v-container>
</template>
