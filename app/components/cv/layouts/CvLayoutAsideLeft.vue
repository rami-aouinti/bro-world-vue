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
.cv-layout{width:100%;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;overflow:visible}
.cv-header{padding:24px;border-bottom:1px solid rgba(148,163,184,.35);background:#fff}
.cv-content{position:relative;padding:24px;min-height:0}
.cv-aside-line{position:absolute;left:var(--cv-aside-width,120px);top:24px;width:4px;height:var(--cv-aside-height,1100px);background:var(--cv-primary,#1d4ed8);border-radius:999px}
.cv-main{min-height:100%;padding-left:calc(var(--cv-aside-width,120px) + 28px)}
</style>
