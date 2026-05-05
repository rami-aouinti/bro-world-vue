<script setup lang="ts">
defineProps<{ items?: string[] }>()
function splitItem(raw:string){ const m=String(raw||'').match(/^(.*)\s\((\d+%)\)$/); return m?{label:m[1],value:m[2]}:{label:String(raw||''),value:''} }
</script>
<template><div class="cv-sec"><div v-for="(item,idx) in (items||[])" :key="idx" class="cv-item-row"><span class="label">{{ splitItem(item).label }}</span><span class="value">•••</span></div></div></template>
<style scoped>.cv-item-row{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px}.label{text-align:start}.value{text-align:end;color:#6366f1;font-weight:700}</style>
