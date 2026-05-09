<template>
  <div class="cv-layout">
    <header class="cv-header"><slot name="header" /></header>
    <section class="cv-content">
      <main class="cv-main"><slot name="content" /></main>
      <aside class="cv-aside-panel"><slot name="aside" /></aside>
    </section>
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(
      220px,
      var(--cv-aside-width, 260px)
    );
  gap: 24px;
  padding: 24px;
  min-height: 0;
}
.cv-aside-panel {
  height: auto;
  min-height: fit-content;
  max-width: 340px;
  background: var(--cv-primary, #1d4ed8);
  border-radius: var(--cv-aside-radius, 32px);
  padding: 18px 18px 10px;
  color: #fff;
}
.cv-main {
  min-height: 100%;
}
</style>
