<script setup lang="ts">
defineProps<{ items?: string[] }>()
function parseItem(raw:string){ const [title='',org='',date='',description='Description...']=String(raw||'').split('§'); return {title,org,date,description} }
</script>
<template><div class="cv-sec cv-sec--timeline"><div v-for="(item,idx) in (items||[])" :key="idx" class="cv-entry"><div class="cv-line-1"><strong>{{ parseItem(item).title }}</strong><span class="date">{{ parseItem(item).date }}</span></div><div class="cv-line-2">{{ parseItem(item).org }}</div><div class="cv-line-3">{{ parseItem(item).description }}</div></div></div></template>
<style scoped>.cv-entry{margin-bottom:8px}.cv-line-1{display:flex;justify-content:space-between;gap:8px}.date{font-size:12px;color:#6366f1;text-align:end}.cv-line-2,.cv-line-3{font-size:12px;color:#475569}.cv-sec--timeline .date{background:#e0e7ff;padding:2px 6px;border-radius:999px}</style>
