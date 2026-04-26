<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string | null | undefined
    size?: number | string
  }>(),
  {
    size: 24,
  },
)

const avatarData = computed(() => useEntityAvatar(props.label))
</script>

<template>
  <v-avatar :size="size" :color="avatarData.color" variant="tonal">
    <span class="text-caption font-weight-bold">{{ avatarData.initials }}</span>
  </v-avatar>
</template>
