<script setup lang="ts">
const { disabled, label } = withDefaults(defineProps<{
  disabled?: boolean
  label?: string
}>(), {
  disabled: false,
  label: 'Freunde',
})
</script>

<template>
  <v-chip
    :disabled="disabled"
    size="small"
    color="grey-darken-2"
    variant="outlined"
    prepend-icon="mdi-account-group"
    append-icon="mdi-menu-down"
  >
    {{ label }}
  </v-chip>
</template>
