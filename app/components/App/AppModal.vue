<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    maxWidth?: string | number
    persistent?: boolean
    density?: 'comfortable' | 'compact'
  }>(),
  {
    maxWidth: 600,
    persistent: false,
    density: 'comfortable',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function closeModal() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    v-model="dialogModel"
    :max-width="maxWidth"
    :persistent="persistent"
  >
    <v-card rounded="xl" class="modal-card">
      <v-card-title
        class="d-flex justify-space-between align-center app-modal-header"
      >
        <span>{{ title }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          :density="density"
          @click="closeModal"
        />
      </v-card-title>

      <v-card-text>
        <slot />
      </v-card-text>

      <v-card-actions v-if="$slots.actions">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.app-modal-header {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    rgb(var(--v-theme-surface))
  );
}
.modal-card {
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 88%, #000 12%);
}
</style>
