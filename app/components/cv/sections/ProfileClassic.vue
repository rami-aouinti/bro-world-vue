<script setup lang="ts">
defineProps<{ text?: string }>()
</script>
<template><div class="cv-sec">{{ text || 'Profile description' }}</div></template>
<style scoped>.cv-sec{padding:8px 0;color:#334155}</style>
