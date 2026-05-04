<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'cletter-001'))
</script>

<template>
  <CoverLetterDocument :template-id="templateId" />
</template>
