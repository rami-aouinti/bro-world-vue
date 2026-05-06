<script setup lang="ts">
defineProps<{ items?: string[] }>()
function splitItem(raw:string){ const m=String(raw||'').match(/^(.*)\s\((\d+%)\)$/); return m?{label:m[1],value:m[2]}:{label:String(raw||''),value:''} }
</script>
<template><div class="cv-sec"><div v-for="(item,idx) in (items||[])" :key="idx" class="cv-item-row"><span class="label">{{ splitItem(item).label }}</span><span class="value">{{ splitItem(item).value }}</span></div></div></template>
<style scoped>.cv-item-row{display:flex;justify-content:space-between;gap:8px}.label{text-align:start}.value{text-align:end;min-width:52px}.cv-item-row{margin:0 0 6px;color:#334155;font-size:13px;line-height:1.35}</style>
