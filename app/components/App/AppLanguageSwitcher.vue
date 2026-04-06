<script setup lang="ts">
const { locale } = useI18n()

const localeOptions = [
  { title: 'English', value: 'en' },
  { title: 'Deutsch', value: 'de' },
  { title: 'Français', value: 'fr' },
] as const
</script>

<template>
  <v-select
    v-model="locale"
    :items="localeOptions"
    item-title="title"
    item-value="value"
    variant="outlined"
    density="compact"
    hide-details
    class="app-language-switcher"
    style="min-width: 140px; max-width: 160px"
    aria-label="Language"
  />
</template>

<style scoped>
.app-language-switcher {
  margin-inline-end: 8px;
}
</style>
