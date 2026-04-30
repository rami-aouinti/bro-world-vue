<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    logo?: string | null
    teamName: string
    size?: number
  }>(),
  {
    logo: null,
    size: 28,
  },
)

const imageFailed = ref(false)

const normalizedLogo = computed(() => {
  if (typeof props.logo !== 'string') {
    return ''
  }

  return props.logo.trim()
})

const shouldShowImage = computed(() => {
  return normalizedLogo.value.length > 0 && !imageFailed.value
})

const initials = computed(() => {
  const words = props.teamName
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)

  if (!words.length) {
    return '??'
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
})

watch(
  () => props.logo,
  () => {
    imageFailed.value = false
  },
)

const avatarColor = computed(() =>
  shouldShowImage.value ? undefined : 'grey-darken-2',
)
</script>

<template>
  <v-avatar :size="size" :color="avatarColor" rounded="lg" class="team-avatar">
    <v-img
      v-if="shouldShowImage"
      :src="normalizedLogo"
      :alt="`${teamName} logo`"
      cover
      @error="imageFailed = true"
    />
    <span v-else class="text-caption font-weight-bold">{{ initials }}</span>
  </v-avatar>
</template>
