<script setup lang="ts">
defineProps<{ items?: string[] }>()
</script>
<template><div class="cv-sec cv-sec--stars"><div v-for="(item,idx) in (items||[])" :key="idx" class="cv-item">{{ item }}</div></div></template>
<style scoped>
.cv-sec--stars .cv-item::after{content:' ★'}
.cv-sec--dots .cv-item::after{content:' •••'}
.cv-sec--progressline .cv-item{background:linear-gradient(90deg,#dbeafe 55%,transparent 55%);padding:4px}
.cv-sec--progresscircle .cv-item::before{content:'◉ ';color:#4f46e5}
.cv-item{margin-bottom:6px}
</style>
