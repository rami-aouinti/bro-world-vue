<template>
  <div class="cv-layout cv-layout--aside"><slot /></div>
</template>
<style scoped>
.cv-layout{width:850px;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;padding:32px}
.cv-layout--aside{display:grid;grid-template-columns:1fr 260px;gap:24px}
</style>
