<template>
  <div class="cv-layout">
    <header class="cv-header"><slot name="header" /></header>
    <section class="cv-content">
      <aside class="cv-aside-panel"><slot name="aside" /></aside>
      <div class="cv-aside-line" />
      <div class="cv-main"><slot name="content" /></div>
    </section>
  </div>
</template>
<style scoped>
.cv-layout{width:100%;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;overflow:visible}
.cv-header{padding:24px;border-bottom:1px solid rgba(148,163,184,.35);background:#fff}
.cv-content{position:relative;padding:24px;min-height:0}
.cv-aside-panel{position:absolute;left:0;top:24px;width:var(--cv-aside-width,120px);height:var(--cv-aside-height,1200px);padding:8px 10px;display:flex;flex-direction:column;gap:8px}
.cv-aside-line{position:absolute;left:var(--cv-aside-width,120px);top:24px;width:6px;height:var(--cv-aside-height,1200px);background:var(--cv-primary,#1d4ed8);border-radius:var(--cv-aside-radius,18px)}
.cv-main{min-height:100%;padding-left:calc(var(--cv-aside-width,120px) + 32px)}
</style>
