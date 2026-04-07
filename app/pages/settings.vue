<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

await navigateTo('/profile/settings', { redirectCode: 301 })
</script>
