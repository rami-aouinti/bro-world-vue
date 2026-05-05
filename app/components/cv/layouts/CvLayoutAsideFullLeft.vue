<template>
  <div class="cv-layout">
    <header class="cv-header"><slot name="header" /></header>
    <section class="cv-content">
      <aside class="cv-aside-panel"><slot name="aside" /></aside>
      <div class="cv-main"><slot name="content" /></div>
    </section>
  </div>
</template>
<style scoped>
.cv-layout{width:100%;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;overflow:visible}
.cv-header{padding:24px;border-bottom:0;background:transparent}
.cv-content{display:grid;grid-template-columns:var(--cv-aside-width,320px) 1fr;gap:24px;padding:24px;min-height:0}
.cv-aside-panel{height:auto;min-height:fit-content;background:var(--cv-primary,#1d4ed8);border-radius:var(--cv-aside-radius,32px);padding:18px 18px 10px;color:#fff}
.cv-main{min-height:100%}
</style>
