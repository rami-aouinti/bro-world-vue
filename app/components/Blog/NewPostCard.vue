<script setup lang="ts">
type NewPostPayload = {
  title: string
  content: string
  youtubeUrl?: string
  imageUrl?: string
  videoUrl?: string
  coverImage?: string
  tags?: string[]
  images?: string[]
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    placeholder?: string
    modelValue?: string
  }>(),
  {
    disabled: false,
    placeholder: 'Was machst du gerade,',
    modelValue: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [payload: NewPostPayload]
}>()

const isOpen = ref(false)
const localContent = ref(props.modelValue)

const content = computed({
  get: () => localContent.value,
  set: (value: string) => {
    localContent.value = value
    emit('update:modelValue', value)
  },
})

watch(
  () => props.modelValue,
  (value) => {
    localContent.value = value ?? ''
  },
)

function openDialog() {
  if (props.disabled) {
    return
  }

  isOpen.value = true
}

function onSubmit(payload: NewPostPayload) {
  emit('submit', payload)
  localContent.value = ''
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
