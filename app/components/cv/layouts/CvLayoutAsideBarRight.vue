<template>
  <div class="cv-layout">
    <header class="cv-header"><slot name="header" /></header>
    <section class="cv-content">
      <div class="cv-main"><slot name="content" /></div>
      <div class="cv-aside-wrap">
        <div class="cv-aside-line" />
        <aside class="cv-aside-panel"><slot name="aside" /></aside>
      </div>
    </section>
  </div>
</template>
<style scoped>
.cv-layout{width:100%;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;overflow:visible}
.cv-header{padding:24px;background:var(--cv-primary,#1d4ed8);color:#fff}
.cv-content{position:relative;padding:24px}
.cv-aside-wrap{position:absolute;right:0;top:24px;display:flex;align-items:stretch}
.cv-aside-panel{width:var(--cv-aside-width,120px);height:var(--cv-aside-height,1100px);border-radius:var(--cv-aside-radius,18px);padding:8px 10px 10px;display:flex;flex-direction:column;gap:8px}
.cv-aside-line{width:6px;background:var(--cv-primary,#1d4ed8);border-radius:18px}
.cv-main{padding-right:calc(var(--cv-aside-width,120px) + 32px)}
</style>
