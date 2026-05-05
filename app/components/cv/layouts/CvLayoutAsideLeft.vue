<template>
  <div class="cv-layout">
    <header class="cv-header"><slot name="header" /></header>
    <section class="cv-content">
      <div class="cv-aside-line cv-aside-line--left" />
      <div class="cv-main"><slot name="content" /></div>
    </section>
  </div>
</template>
<style scoped>
.cv-layout{width:100%;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;overflow:hidden}
.cv-header{padding:24px;border-bottom:1px solid rgba(148,163,184,.35);background:#fff}
.cv-content{display:grid;grid-template-columns:20px 1fr;gap:20px;padding:24px;min-height:calc(1123px - 89px)}
.cv-aside-line{width:4px;height:100%;background:var(--cv-primary,#1d4ed8);border-radius:999px;justify-self:center}
.cv-main{min-height:100%}
</style>
