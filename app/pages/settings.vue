<script setup lang="ts">
definePageMeta({
  title: 'Settings redirect',
  description:
    'Redirects private Bro World settings URLs to the authenticated profile settings page.',
  robots: { index: false, follow: false },
  sitemap: false,
  middleware: 'auth',
})

await navigateTo('/profile/settings', { redirectCode: 301 })
</script>
