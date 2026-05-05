<script setup lang="ts">
defineProps<{ items?: string[] }>()
</script>
<template>
  <div class="cv-sec cv-sec--timeline">
    <div v-for="(item,idx) in (items||[])" :key="idx" class="cv-item">{{ item }}</div>
  </div>
</template>
<style scoped>
.cv-sec{background:transparent;border:0;box-shadow:none;padding:2px 0}
.cv-item{margin:0 0 6px;color:#334155;font-size:13px;line-height:1.35}
.cv-sec--timeline{border-left:0;padding-left:0}
.cv-sec--cards .cv-item{box-shadow:none;border-radius:0;padding:0}
.cv-sec--dot .cv-item::before{content:'• ';font-weight:700;color:var(--cv-secondary,#93C5FD)}
.cv-sec--stars .cv-item::after{content:' ★';color:var(--cv-secondary,#93C5FD)}
.cv-sec--dots .cv-item::after{content:' •••';color:var(--cv-secondary,#93C5FD)}
.cv-sec--progressline .cv-item{background:linear-gradient(90deg, color-mix(in srgb, var(--cv-secondary,#93C5FD) 18%, white) 55%, transparent 55%);padding:2px 6px;border-radius:6px}
.cv-sec--progresscircle .cv-item::before{content:'◉ ';color:var(--cv-secondary,#93C5FD)}
</style>
