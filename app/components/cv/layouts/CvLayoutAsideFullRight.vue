<template>
  <div class="cv-layout">
    <header class="cv-header"><slot name="header" /></header>
    <section class="cv-content">
      <div class="cv-main"><slot name="content" /></div>
      <div class="cv-aside-pill cv-aside-pill--right" />
    </section>
  </div>
</template>
<style scoped>
.cv-layout{width:100%;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;overflow:visible}
.cv-header{padding:24px;border-bottom:1px solid rgba(148,163,184,.35);background:#fff}
.cv-content{display:grid;grid-template-columns:1fr var(--cv-aside-width, 220px);gap:24px;padding:24px;min-height:0}
.cv-aside-pill{width:100%;height:var(--cv-aside-height, 1100px);background:var(--cv-primary,#1d4ed8);border-radius:var(--cv-aside-radius,32px)}
</style>
