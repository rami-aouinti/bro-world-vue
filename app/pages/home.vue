<script setup>
definePageMeta({
  title: 'Home redirect',
  description: 'Redirects legacy Bro World home URLs to the main homepage.',
  robots: { index: false, follow: true },
  sitemap: false,
})

await navigateTo('/', { redirectCode: 301 })
</script>

<template>
  <div>Redirect to Home...</div>
</template>
