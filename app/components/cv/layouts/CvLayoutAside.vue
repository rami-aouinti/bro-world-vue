<template>
  <div class="cv-layout cv-layout--aside">
    <aside class="cv-aside-panel">
      <slot name="header" />
    </aside>
    <section class="cv-main-content">
      <slot name="content" />
    </section>
  </div>
</template>

<style scoped>
.cv-layout{width:850px;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;display:grid;grid-template-columns:260px 1fr;overflow:hidden}
.cv-aside-panel{background:var(--cv-primary, #1d4ed8);color:#fff;padding:24px}
.cv-main-content{padding:24px}
</style>
