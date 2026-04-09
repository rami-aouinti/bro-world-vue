<script setup lang="ts">
const { t } = useI18n()
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    label?: string
  }>(),
  {
    disabled: false,
    label: '',
  },
)
const theme = useTheme()
const isLightTheme = computed(() => !theme.current.value.dark)
const chipLabel = computed(
  () => props.label || t('blog.newPost.audience.friends'),
)
</script>

<template>
  <v-chip
    :disabled="props.disabled"
    size="small"
    :color="isLightTheme ? 'grey-lighten-3' : 'grey-darken-2'"
    variant="outlined"
    prepend-icon="mdi-account-group"
    append-icon="mdi-menu-down"
  >
    {{ chipLabel }}
  </v-chip>
</template>
