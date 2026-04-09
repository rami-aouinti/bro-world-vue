<script setup lang="ts">
const { t, te, locale, locales, setLocale } = useI18n({ useScope: 'global' })

type LocaleOption = {
  title: string
  value: string
  code: string
  flagClass: string
}

const localeOptions: LocaleOption[] = [
  { title: 'appbar.languages.en', value: 'en', code: 'GB', flagClass: 'fi fi-gb' },
  { title: 'appbar.languages.fr', value: 'fr', code: 'FR', flagClass: 'fi fi-fr' },
  { title: 'appbar.languages.es', value: 'es', code: 'ES', flagClass: 'fi fi-es' },
  { title: 'appbar.languages.de', value: 'de', code: 'DE', flagClass: 'fi fi-de' },
]

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
        size="28"
        class="app-language-switcher__activator"
        aria-label="Language"
      >
        <span
          class="app-language-switcher__flag"
          :class="selectedLocale.flagClass"
          :aria-label="t(selectedLocale.title)"
          role="img"
        />
      </v-btn>
    </template>

    <v-list min-width="220">
      <v-list-item
        v-for="item in localeOptions"
        :key="item.value"
        :active="locale === item.value"
        @click="setLocale(item.value)"
      >
        <template #prepend>
          <span
            class="app-language-switcher__flag"
            :class="item.flagClass"
            :aria-label="t(item.title)"
            role="img"
          />
        </template>
        <v-list-item-title class="text-h6 text-medium-emphasis">
          {{ t(item.title) }}
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
@import '~/assets/styles/flag-icons.scss';

.app-language-switcher__activator {
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.app-language-switcher__flag {
  border-radius: 999px;
  width: 28px;
  height: 28px;
  display: inline-block;
  vertical-align: middle;
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-on-surface), 0.12);
}

.app-language-switcher__code {
  font-weight: 600;
  letter-spacing: 0.04em;
}
</style>
