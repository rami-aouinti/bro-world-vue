<template>
  <div class="cv-layout cv-layout--aside">
    <header class="cv-header cv-header--aside">
      <div class="cv-header-band">
        <slot name="header" />
      </div>
    </header>
    <div class="cv-body">
      <aside class="cv-aside-panel" />
      <section class="cv-main-content">
        <slot name="content" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.cv-layout{width:850px;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;overflow:hidden}
.cv-header{padding:0 0 18px}
.cv-header-band{background:var(--cv-primary, #1d4ed8);height:var(--cv-aside-height, 180px);width:var(--cv-aside-width, 100%);border-bottom-left-radius:var(--cv-aside-radius, 24px);border-bottom-right-radius:var(--cv-aside-radius, 24px);display:flex;align-items:center;padding:24px;color:#fff}
.cv-body{display:grid;grid-template-columns:260px 1fr;min-height:calc(1123px - 198px)}
.cv-aside-panel{background:rgba(15,23,42,.04)}
.cv-main-content{padding:24px}
</style>
