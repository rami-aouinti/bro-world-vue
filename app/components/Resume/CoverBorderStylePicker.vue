<script setup lang="ts">
import { COVER_BORDER_STYLES } from '~/constants/coverBorderStyles'

const selectedBorderStyle = defineModel<string>({ default: 'simple' })

const borderStyleOptions = computed(() => [
  {
    id: 'simple',
    name: 'Simple',
    className: 'cover-border--simple',
  },
  ...COVER_BORDER_STYLES,
])
</script>

<template>
  <div class="cover-border-style-picker">
    <p class="text-body-2 mb-2">Border style</p>
    <v-chip-group
      v-model="selectedBorderStyle"
      selected-class="text-primary"
      mandatory
      column
    >
      <v-chip
        v-for="style in borderStyleOptions"
        :key="style.id"
        :value="style.id"
        class="cover-border-style-chip"
        variant="outlined"
      >
        <span :class="['cover-border-thumb', `cover-border--${style.id}`]" />
        <span>{{ style.name }}</span>
      </v-chip>
    </v-chip-group>
  </div>
</template>

<style scoped>
.cover-border-style-chip {
  height: auto;
  min-height: 48px;
  padding-block: 6px;
}

.cover-border-style-chip :deep(.v-chip__content) {
  align-items: center;
  gap: 8px;
}
</style>
