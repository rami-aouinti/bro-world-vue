<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Shop Admin' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-4">
      <h2 class="text-h5 mb-2">Shop - Admin</h2>
      <p v-if="isRoot" class="text-medium-emphasis mb-0">
        Admin workspace for the World shop module.
      </p>
      <p v-else class="text-error mb-0">Access denied. This page requires ROLE_ROOT.</p>
    </v-card>
  </v-container>
</template>
