<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
  placeholder?: string
  modelValue?: string
}>(), {
  disabled: false,
  placeholder: 'Was machst du gerade, Rami?',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [content: string]
}>()

const isOpen = ref(false)

const content = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

function openDialog() {
  if (props.disabled) {
    return
  }

  isOpen.value = true
}

function onSubmit(value: string) {
  emit('submit', value)
  emit('update:modelValue', '')
  isOpen.value = false
}
</script>

<template>
  <div class="mb-4">
    <BlogNewPostLauncher
      :disabled="disabled"
      :placeholder="placeholder"
      @open="openDialog"
    />

    <BlogNewPostDialog
      v-model="content"
      :disabled="disabled"
      :open="isOpen"
      :placeholder="placeholder"
      @update:open="isOpen = $event"
      @submit="onSubmit"
    />
  </div>
</template>
