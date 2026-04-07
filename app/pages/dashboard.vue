<script setup lang="ts">
definePageMeta({
  publicPage: false,
})

await navigateTo('/admin', { redirectCode: 301 })
</script>
