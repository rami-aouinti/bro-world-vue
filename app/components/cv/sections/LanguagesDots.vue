<script setup lang="ts">defineProps<{ items?: string[] }>()
function lbl(raw:string){ return String(raw||'').replace(/\s*\(\d+%\)$/,'') }
</script>
<template><div><div v-for="(item,idx) in (items||[])" :key="idx" class="row"><span>{{ lbl(item) }}</span><span class="dots">●●○○○</span></div></div></template>
<style scoped>.row{display:flex;justify-content:space-between;margin-bottom:8px}.dots{letter-spacing:2px;color:#94a3b8}</style>
