<script setup lang="ts">
defineProps<{ items?: string[] }>()
</script>
<template>
  <div class="cv-sec cv-sec--list">
    <div v-for="(item,idx) in (items||[])" :key="idx" class="cv-item">- {{ item }}</div>
  </div>
</template>
<style scoped>
.cv-sec{background:transparent;border:0;box-shadow:none;padding:2px 0}
.cv-item{margin:0 0 6px;color:#334155;font-size:13px;line-height:1.35}
.cv-sec--timeline{border-left:0;padding-left:0}
.cv-sec--cards .cv-item{box-shadow:none;border-radius:0;padding:0}
.cv-sec--dot .cv-item::before{content:'• ';font-weight:700;color:#6366f1}
.cv-sec--stars .cv-item::after{content:' ★';color:#f59e0b}
.cv-sec--dots .cv-item::after{content:' •••';color:#6366f1}
.cv-sec--progressline .cv-item{background:linear-gradient(90deg, rgba(99,102,241,.16) 55%, transparent 55%);padding:2px 6px;border-radius:6px}
.cv-sec--progresscircle .cv-item::before{content:'◉ ';color:#4f46e5}
</style>
