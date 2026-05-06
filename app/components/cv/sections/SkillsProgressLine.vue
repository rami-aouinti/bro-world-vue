<script setup lang="ts">
defineProps<{ items?: string[] }>()
function splitItem(raw:string){ const m=String(raw||'').match(/^(.*)\s\((\d+)%\)$/); return m?{label:m[1],value:Number(m[2])}:{label:String(raw||''),value:20} }
</script>
<template><div><div v-for="(item,idx) in (items||[])" :key="idx" class="row"><span>{{ splitItem(item).label }}</span><span class="bar"><i :style="{width: splitItem(item).value + '%'}"/></span></div></div></template>
<style scoped>.row{display:grid;grid-template-columns:1fr 90px;gap:8px;align-items:center;margin-bottom:8px}.bar{height:8px;background:rgba(148,163,184,.35);border-radius:999px;overflow:hidden}.bar i{display:block;height:100%;background:var(--cv-secondary,#93C5FD)}</style>
