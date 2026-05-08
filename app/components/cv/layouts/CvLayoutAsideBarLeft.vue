<template>
  <div class="cv-layout">
    <header class="cv-header">
      <div class="cv-header-aside" />
      <slot name="header" />
    </header>
    <section class="cv-content">
      <div class="cv-aside-wrap">
        <aside class="cv-aside-panel"><slot name="aside" /></aside>
        <div class="cv-aside-line" />
      </div>
      <div class="cv-main"><slot name="content" /></div>
    </section>
  </div>
</template>
<style scoped>
.cv-layout{width:100%;min-height:1123px;background:var(--cv-page-background,#fff);color:var(--cv-page-text,#0f172a);border:1px solid rgba(148,163,184,.45);border-radius:0;overflow:visible}
.cv-header{position:relative;padding:24px;background:var(--cv-primary,#1d4ed8);color:#fff;overflow:hidden}
.cv-header-aside{position:absolute;left:24px;bottom:0;width:var(--cv-header-aside-width,var(--cv-aside-width,120px));height:var(--cv-header-aside-height,56px);border-top-left-radius:var(--cv-header-aside-radius,var(--cv-aside-radius,18px));border-top-right-radius:var(--cv-header-aside-radius,var(--cv-aside-radius,18px));background:color-mix(in srgb,var(--cv-primary,#1d4ed8) 75%,#fff);opacity:.45}
.cv-content{position:relative;padding:24px}
.cv-aside-wrap{position:absolute;left:0;top:24px;display:flex;align-items:stretch;overflow:hidden;border-radius:var(--cv-aside-radius,18px)}
.cv-aside-panel{width:var(--cv-aside-width,120px);height:var(--cv-aside-height,1100px);border-radius:var(--cv-aside-radius,18px);padding:8px 10px 10px;display:flex;flex-direction:column;gap:8px}
.cv-aside-line{width:6px;background:var(--cv-primary,#1d4ed8)}
.cv-main{padding-left:calc(var(--cv-aside-width,120px) + 32px)}
</style>
