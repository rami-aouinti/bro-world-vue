<template>
  <div class="cv-layout cv-layout--no-aside">
    <header class="cv-header"><slot name="header" /></header>
    <section class="cv-content"><slot name="content" /></section>
  </div>
</template>
<style scoped>
.cv-layout {
  width: 100%;
  min-height: 1123px;
  background: var(--cv-page-background, #fff);
  color: var(--cv-page-text, #0f172a);
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 0;
  overflow: visible;
}
.cv-header {
  padding: 24px;
  border-bottom: 0;
  background: transparent;
}
.cv-content {
  padding: 24px;
}
</style>
