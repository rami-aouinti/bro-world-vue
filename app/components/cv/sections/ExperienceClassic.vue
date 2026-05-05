<script setup lang="ts">
defineProps<{ items?: string[] }>()
</script>
<template>
  <div class="cv-sec cv-sec--classic">
    <div v-for="(item,idx) in (items||[])" :key="idx" class="cv-item">{{ item }}</div>
  </div>
</template>
<style scoped>
.cv-sec--timeline{border-left:3px solid #6366f1;padding-left:10px}
.cv-sec--cards .cv-item{box-shadow:0 2px 8px rgba(15,23,42,.08);border-radius:8px;padding:8px}
.cv-sec--dot .cv-item::before{content:'• ';font-weight:700}
.cv-sec--list .cv-item{list-style:disc;margin-left:10px}
.cv-item{margin-bottom:6px}
</style>
