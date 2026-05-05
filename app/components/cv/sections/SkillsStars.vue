<script setup lang="ts">defineProps<{ items?: string[] }>()
function lbl(raw:string){ return String(raw||'').replace(/\s*\(\d+%\)$/,'') }
</script>
<template><div><div v-for="(item,idx) in (items||[])" :key="idx" class="row"><span>{{ lbl(item) }}</span><span class="stars">★★★★★</span></div></div></template>
<style scoped>.row{display:flex;justify-content:space-between;margin-bottom:8px}.stars{letter-spacing:.75px;font-size:12px;color:var(--cv-secondary,#93C5FD)}</style>
