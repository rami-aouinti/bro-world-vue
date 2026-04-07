<script setup lang="ts">
const props = withDefaults(defineProps<{
  mode?: 'comment' | 'reply'
  loading?: boolean
  placeholder?: string
}>(), {
  mode: 'comment',
  loading: false,
  placeholder: 'Als Rami Aouinti kommentieren',
})

const emit = defineEmits<{
  submit: [content: string]
  cancel: []
}>()

const content = ref('')

const actionLabel = computed(() => props.mode === 'reply' ? 'Répondre' : 'Commenter')

function onSubmit() {
  const value = content.value.trim()

  if (!value || props.loading) {
    return
  }

  emit('submit', value)
  content.value = ''
}
</script>

<template>
  <div class="d-flex flex-column ga-2">
    <v-textarea
      v-model="content"
      :placeholder="placeholder"
      rows="2"
      auto-grow
      variant="solo"
      flat
      hide-details
      class="comment-input"
    />

    <div class="d-flex ga-2 justify-end">
      <v-btn variant="text" :disabled="loading" @click="emit('cancel')">
        Annuler
      </v-btn>
      <v-btn color="primary" :loading="loading" @click="onSubmit">
        {{ actionLabel }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.comment-input :deep(.v-field) {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
}
</style>
