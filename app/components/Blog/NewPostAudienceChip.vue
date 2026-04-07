<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    label?: string
  }>(),
  {
    disabled: false,
    label: 'Freunde',
  },
)
const theme = useTheme()
const isLightTheme = computed(() => !theme.current.value.dark)
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
    {{ props.label }}
  </v-chip>
</template>
