<script setup lang="ts">
defineProps<{ items?: string[] }>()
</script>
<template><div class="cv-sec cv-sec--list"><div v-for="(item,idx) in (items||[])" :key="idx" class="cv-item">{{ item }}</div></div></template>
<style scoped>
.cv-sec--cards .cv-item{box-shadow:0 2px 8px rgba(15,23,42,.08);border-radius:8px;padding:8px}
.cv-sec--dot .cv-item::before{content:'• ';font-weight:700}
.cv-item{margin-bottom:6px}
</style>
