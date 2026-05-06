<script setup lang="ts">
defineProps<{ items?: string[] }>()
function parseItem(raw:string){ const [title='',org='',date='',description='Description...']=String(raw||'').split('§'); return {title,org,date,description} }
</script>
<template><div class="cv-sec"><div v-for="(item,idx) in (items||[])" :key="idx" class="cv-entry"><div class="cv-line-1"><strong>{{ parseItem(item).title }}</strong><span class="date">{{ parseItem(item).date }}</span></div><div class="cv-line-2">{{ parseItem(item).org }}</div><div class="cv-line-3 dot">{{ parseItem(item).description }}</div></div></div></template>
<style scoped>.cv-entry{margin-bottom:8px}.cv-line-1{display:flex;justify-content:space-between;gap:8px}.cv-line-1 strong{font-size:13px}.date{font-size:12px;color:var(--cv-secondary,#93C5FD);text-align:end}.cv-line-2,.cv-line-3{font-size:12px;color:#475569}.dot::before{content:'• ';color:var(--cv-secondary,#93C5FD);font-weight:700}</style>
