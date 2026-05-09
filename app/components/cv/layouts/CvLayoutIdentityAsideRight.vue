<template>
  <div class="cv-layout">
    <section class="cv-body">
      <header class="cv-header"><slot name="header" /></header>
      <main class="cv-main"><slot name="content" /></main>
    </section>
    <aside class="cv-identity-aside">
      <slot name="identity" />
      <slot name="aside" />
    </aside>
  </div>
</template>

<style scoped>
.cv-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(
      220px,
      var(--cv-aside-width, 260px)
    );
  width: 100%;
  height: 100%;
  min-height: 1123px;
  background: var(--cv-page-background, #fff);
  color: var(--cv-page-text, #0f172a);
  border: var(--cv-page-border-width, 1px) solid
    var(--cv-page-border-color, rgba(148, 163, 184, 0.45));
  border-radius: var(--cv-page-border-radius, 0);
  overflow: hidden;
}

.cv-body {
  display: flex;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
}

.cv-header {
  padding: 24px;
  border-bottom: 0;
  background: transparent;
}

.cv-main {
  flex: 1 1 auto;
  min-height: 0;
  padding: 24px;
}

.cv-identity-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 1123px;
  padding: 24px;
  background: var(--cv-primary, #1d4ed8);
  color: #fff;
}
</style>
