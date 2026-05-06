<script setup lang="ts">
defineProps<{ items?: string[] }>()
function splitItem(raw:string){ const m=String(raw||'').match(/^(.*)\s\((\d+)%\)$/); return m?{label:m[1],value:Number(m[2])}:{label:String(raw||''),value:20} }
</script>
<template><div><div v-for="(item,idx) in (items||[])" :key="idx" class="row"><span>{{ splitItem(item).label }}</span><span class="circle">{{ splitItem(item).value }}%</span></div></div></template>
<style scoped>.row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.circle{width:39px;height:39px;border-radius:999px;border:2px solid var(--cv-secondary,#93C5FD);display:flex;align-items:center;justify-content:center;font-size:9px}</style>
