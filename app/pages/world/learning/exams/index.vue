<script setup lang="ts">
definePageMeta({ title: 'Learning Exams' })

const { data, pending, error, refresh } = await useAsyncData(
  'learning-school-exams',
  () => $fetch<{ items: Record<string, unknown>[] }>('/api/world/learning/public/school/exams'),
)

const headers = computed(() => {
  const first = (data.value?.items ?? [])[0] ?? {}
  return Object.keys(first).map((key) => ({ title: key, key }))
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h5">Exams</h1>
          <p class="text-medium-emphasis mb-0">Public school endpoint: /school/general/exams</p>
        </div>
        <v-btn variant="text" prepend-icon="mdi-refresh" :loading="pending" @click="refresh">
          Refresh
        </v-btn>
      </div>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="error.message"
      />

      <v-data-table
        :headers="headers"
        :items="data?.items ?? []"
        :loading="pending"
        density="comfortable"
      />
    </v-card>
  </v-container>
</template>
