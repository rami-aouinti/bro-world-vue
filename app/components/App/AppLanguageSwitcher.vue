<script setup lang="ts">
const { locale } = useI18n()

const localeOptions = [
  { title: 'English', value: 'en', flag: '🇬🇧' },
  { title: 'Français', value: 'fr', flag: '🇫🇷' },
  { title: 'Español', value: 'es', flag: '🇪🇸' },
  { title: 'Deutsch', value: 'de', flag: '🇩🇪' },
] as const

const selectedLocale = computed(
  () =>
    localeOptions.find((item) => item.value === locale.value) ??
    localeOptions[0],
)
</script>

<template>
  <v-menu location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        class="app-language-switcher__activator"
        aria-label="Language"
      >
        <span class="app-language-switcher__flag">{{
          selectedLocale.flag
        }}</span>
      </v-btn>
    </template>

    <v-list class="app-language-switcher__menu" min-width="280">
      <v-list-item
        v-for="item in localeOptions"
        :key="item.value"
        :active="locale === item.value"
        @click="locale = item.value"
      >
        <template #prepend>
          <span class="app-language-switcher__flag">{{ item.flag }}</span>
        </template>
        <v-list-item-title class="text-h6 text-medium-emphasis">
          {{ item.title }}
        </v-list-item-title>
        <template #append>
          <v-icon
            v-if="locale === item.value"
            icon="mdi-check"
            size="20"
            color="primary"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.app-language-switcher__menu :deep(.v-list-item) {
  min-height: 72px;
  padding-inline: 18px;
}

.app-language-switcher__activator {
  min-width: 54px;
  border-radius: 10px;
}

.app-language-switcher__flag {
  font-size: 28px;
  line-height: 1;
}
</style>
