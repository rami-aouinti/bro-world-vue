<script setup lang="ts">
definePageMeta({
  title: 'Page not found',
  description:
    'The requested Bro World page could not be found. Use the navigation to return to public platform pages.',
  robots: { index: false, follow: false },
  sitemap: false,
})
</script>

<template>
  <v-empty-state
    headline="Whoops, 404"
    title="Page not found"
    text="The page you were looking for does not exist"
    icon="custom:nustar"
  />
</template>
