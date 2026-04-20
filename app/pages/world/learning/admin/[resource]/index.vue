<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Learning Admin Resource' })

const route = useRoute()
const router = useRouter()
const resource = computed(() => String(route.params.resource ?? ''))

const allowedResources = new Set(['teachers', 'students', 'exams', 'grades'])
if (!allowedResources.has(resource.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
}

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const canAccess = computed(() => {
  const roles = sessionUser.value?.roles ?? []
  return roles.includes('ROLE_ROOT') || roles.includes('ROLE_ADMIN')
})
if (!canAccess.value) {
  await router.replace('/world/learning')
}

const pending = ref(false)
const error = ref<string | null>(null)
const rows = ref<Record<string, unknown>[]>([])

const title = computed(
  () => resource.value.charAt(0).toUpperCase() + resource.value.slice(1),
)

async function load() {
  pending.value = true
  error.value = null
  try {
    const response = await $fetch<{ items: Record<string, unknown>[] }>(
      `/api/world/learning/admin/school/${resource.value}`,
    )
    rows.value = response.items
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load data'
  } finally {
    pending.value = false
  }
}

await load()

const headers = computed(() => {
  const first = rows.value[0] ?? {}
  return Object.keys(first).map((key) => ({ title: key, key }))
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h5">{{ title }}</h1>
          <p class="text-medium-emphasis mb-0">Read-only listing for {{ resource }}.</p>
        </div>
        <div class="d-flex ga-2">
          <v-btn variant="tonal" to="/world/learning/admin" prepend-icon="mdi-arrow-left">Back to admin</v-btn>
          <v-btn variant="text" prepend-icon="mdi-refresh" :loading="pending" @click="load">Refresh</v-btn>
        </div>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

      <v-data-table :headers="headers" :items="rows" :loading="pending" density="comfortable" />
    </v-card>
  </v-container>
</template>
