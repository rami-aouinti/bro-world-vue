<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  payload?: Record<string, unknown> | null
  loading?: boolean
  error?: string | null
}>(), {
  payload: null,
  loading: false,
  error: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const hasPayload = computed(() => !!props.payload)
</script>

<template>
  <AppModal v-model="dialogModel" :title="title" max-width="920">
    <div v-if="loading" class="d-flex flex-column ga-2">
      <v-skeleton-loader type="heading" class="rounded" />
      <v-skeleton-loader type="text@3" class="rounded" />
      <v-skeleton-loader type="list-item-two-line@2" class="rounded" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-3">
      {{ error }}
    </v-alert>

    <div v-else-if="hasPayload">
      <slot name="summary" :payload="payload" />

      <v-expansion-panels variant="accordion" class="mt-4">
        <v-expansion-panel>
          <v-expansion-panel-title>
            Debug JSON
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <pre class="json-preview">{{ JSON.stringify(payload, null, 2) }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <v-alert v-else type="info" variant="tonal">
      Aucun détail disponible pour le moment.
    </v-alert>
  </AppModal>
</template>

<style scoped>
.json-preview {
  max-height: 320px;
  overflow: auto;
  padding: 12px;
  border-radius: 10px;
  background: rgba(10, 10, 10, 0.5);
  font-size: 12px;
}
</style>
