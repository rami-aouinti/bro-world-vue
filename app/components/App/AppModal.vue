<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    maxWidth?: string | number
    persistent?: boolean
  }>(),
  {
    maxWidth: 600,
    persistent: false,
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
    <v-card rounded="xl" class="postcard-gradient-card">
      <v-card-title
        class="d-flex justify-space-between align-center text-white app-modal-header"
      >
        <span>{{ title }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          density="comfortable"
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
    135deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-primary-gradient))
  );
}
</style>
