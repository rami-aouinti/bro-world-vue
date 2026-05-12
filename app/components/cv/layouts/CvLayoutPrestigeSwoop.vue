<template>
  <div class="cv-layout cv-layout--prestige-swoop">
    <div class="cv-stripe cv-stripe--top" />
    <div class="cv-stripe cv-stripe--inner" />
    <div class="cv-stripe cv-stripe--bottom" />

    <section class="cv-page-grid">
      <aside class="cv-aside-panel"><slot name="aside" /></aside>
      <main class="cv-main-wrap">
        <header class="cv-header"><slot name="header" /></header>
        <section class="cv-main"><slot name="content" /></section>
      </main>
    </section>
  </div>
</template>

<style scoped>
.cv-layout {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 1123px;
  overflow: hidden;
  background: var(--cv-page-background, #fff);
  color: var(--cv-page-text, #1f2937);
  border: 1px solid rgba(15, 23, 42, 0.2);
}

.cv-layout::before,
.cv-layout::after,
.cv-stripe {
  content: '';
  position: absolute;
  pointer-events: none;
}

.cv-layout::before {
  z-index: 0;
  top: -128px;
  left: 0;
  width: 100%;
  height: 330px;
  background: var(--cv-secondary, #b91c1c);
  clip-path: ellipse(68% 42% at 50% 0%);
}

.cv-layout::after {
  z-index: 0;
  top: -70px;
  left: 74px;
  width: 86%;
  height: 270px;
  border-radius: 0 0 50% 50%;
  border-bottom: 34px solid var(--cv-primary, #1f2933);
  transform: rotate(-2deg);
  box-shadow:
    0 18px 0 #fff,
    0 40px 0 var(--cv-primary, #1f2933),
    0 62px 0 #fff;
}

.cv-stripe--top {
  z-index: 0;
  top: 74px;
  left: -120px;
  width: 440px;
  height: 240px;
  border-radius: 50%;
  background: var(--cv-primary, #1f2933);
  transform: rotate(-20deg);
  box-shadow: 22px 25px 0 10px #fff;
}

.cv-stripe--inner {
  z-index: 0;
  top: 176px;
  left: 82px;
  width: 165px;
  height: 420px;
  border-left: 2px dashed
    color-mix(in srgb, var(--cv-secondary, #b91c1c) 60%, #fff);
}

.cv-stripe--bottom {
  z-index: 0;
  right: -145px;
  bottom: -98px;
  width: 440px;
  height: 250px;
  border-radius: 50%;
  border: 12px solid var(--cv-secondary, #b91c1c);
  box-shadow:
    -24px -16px 0 var(--cv-primary, #1f2933),
    -48px -34px 0 #fff;
}

.cv-page-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(208px, var(--cv-aside-width, 245px)) minmax(
      0,
      1fr
    );
  min-height: 1123px;
}

.cv-aside-panel {
  min-width: 0;
  padding: 270px 22px 36px 32px;
}

.cv-main-wrap {
  min-width: 0;
  padding: 64px 42px 42px 10px;
}

.cv-header {
  min-height: 180px;
  display: flex;
  align-items: flex-start;
}

.cv-main :deep(.cv-sections-list) {
  grid-template-columns: 1fr;
  gap: 12px;
}

.cv-aside-panel :deep(.cv-aside-sections) {
  gap: 18px;
}

.cv-aside-panel :deep(.cv-aside-section-item) {
  padding: 10px 0;
}

.cv-main :deep(.cv-section-row) {
  position: relative;
  padding: 4px 0 8px 38px;
}

.cv-main :deep(.cv-section-row::before) {
  content: '';
  position: absolute;
  left: 5px;
  top: 13px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #fff;
  border: 3px solid var(--cv-secondary, #b91c1c);
  box-shadow: 0 0 0 7px rgba(185, 28, 28, 0.08);
}

.cv-main :deep(.cv-section-title-shell),
.cv-aside-panel :deep(.cv-section-title-shell) {
  min-width: min(100%, 230px);
  padding: 7px 18px;
  border-radius: 999px;
  background: var(--cv-secondary, #b91c1c) !important;
  color: #fff !important;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.08em;
  box-shadow: -18px 0 0 var(--cv-primary, #1f2933);
}

.cv-main :deep(.cv-section-title-shell::after),
.cv-aside-panel :deep(.cv-section-title-shell::after) {
  display: none !important;
}

.cv-header :deep(.cv-header-layout) {
  width: 100%;
}

.cv-header :deep(.cv-header-layout--header-right),
.cv-header :deep(.cv-header-layout--header-left) {
  grid-template-columns: 1fr;
}

.cv-header :deep(.cv-header-contact) {
  display: none;
}

.cv-header :deep(.cv-header-identity) {
  align-items: center;
  text-align: center;
  color: var(--cv-primary, #1f2933);
}

.cv-header :deep(.cv-header-editor--name) {
  font-style: italic;
  letter-spacing: 0.02em;
}

.cv-header :deep(.cv-header-editor--role) {
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--cv-secondary, #b91c1c) !important;
}

.cv-header :deep(.cv-header-avatar) {
  transform: translate(-410px, 34px);
  box-shadow:
    0 0 0 12px #fff,
    0 0 0 28px var(--cv-primary, #1f2933),
    0 0 0 34px rgba(255, 255, 255, 0.92);
}

@media (max-width: 720px) {
  .cv-page-grid {
    grid-template-columns: 1fr;
  }

  .cv-aside-panel,
  .cv-main-wrap {
    padding: 24px;
  }

  .cv-header :deep(.cv-header-avatar) {
    transform: none;
  }
}
</style>
