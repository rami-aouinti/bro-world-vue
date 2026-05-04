<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'cpage-001'))
</script>

<template>
  <CoverPageDocument :template-id="templateId" />
</template>
