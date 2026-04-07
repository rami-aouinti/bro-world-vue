<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'appbar.settings',
})
</script>

<template>
  <v-container class="py-12">
    <h1 class="text-h3 mb-4">{{ t('appbar.settings') }}</h1>
    <p>Personnalisez vos préférences et les paramètres de votre compte.</p>
  </v-container>
</template>
