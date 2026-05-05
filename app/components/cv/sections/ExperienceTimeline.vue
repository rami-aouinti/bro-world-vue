<script setup lang="ts">
defineProps<{ items?: string[] }>()
function parseItem(raw:string){ const [title='',org='',date='',description='']=String(raw||'').split('§'); return {title,org,date,description} }
</script>
<template>
  <div class="timeline">
    <div v-for="(item,idx) in (items||[])" :key="idx" class="t-item">
      <div class="t-dot" />
      <div class="t-date">{{ parseItem(item).date }}</div>
      <div class="t-body">
        <strong>{{ parseItem(item).title }}</strong>
        <div class="sub">{{ parseItem(item).org }}</div>
        <div>{{ parseItem(item).description }}</div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.timeline{position:relative;padding-left:22px}.timeline::before{content:'';position:absolute;left:7px;top:6px;bottom:6px;width:1px;background:color-mix(in srgb, var(--cv-secondary,#93C5FD) 45%, white)}
.t-item{position:relative;margin-bottom:14px;display:grid;grid-template-columns:100px 1fr;column-gap:12px}.t-dot{position:absolute;left:-18px;top:4px;width:12px;height:12px;border-radius:999px;border:2px solid var(--cv-secondary,#93C5FD);background:#fff}.t-date{font-size:12px;color:#64748b}.sub{color:#475569;margin:2px 0 4px}
</style>
