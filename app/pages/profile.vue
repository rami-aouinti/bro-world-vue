<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'appbar.profile',
})
</script>

<template>
  <v-container class="py-12">
    <h1 class="text-h3 mb-4">{{ t('appbar.profile') }}</h1>
    <p>Consultez et mettez à jour les informations de votre profil.</p>
  </v-container>
</template>
