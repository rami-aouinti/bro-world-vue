<script setup lang="ts">
const route = useRoute()

const targetPath = computed(() => {
  const fullPath = String(route.fullPath || '/crm')
  return fullPath.replace(/^\/crm(?=\/|$)/, '/world/crm')
})

await navigateTo(targetPath.value, { redirectCode: 301 })
</script>

<template><div /></template>
