<template>
  <div class="cv-layout cv-layout--orange-flow-split">
    <div class="cv-wave cv-wave--top-left" />
    <div class="cv-wave cv-wave--center" />
    <div class="cv-wave cv-wave--right" />
    <div class="cv-wave cv-wave--bottom" />

    <section class="cv-grid">
      <main class="cv-left">
        <header class="cv-header"><slot name="header" /></header>
        <slot name="content" />
      </main>
      <aside class="cv-aside-panel"><slot name="aside" /></aside>
    </section>
  </div>
</template>

<style scoped>
.cv-layout {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 1123px;
  overflow: hidden !important;
  contain: paint;
  background:
    radial-gradient(
      circle at 86% 9%,
      rgba(255, 255, 255, 0.92) 0 88px,
      transparent 89px
    ),
    var(--cv-page-background, #ffffff);
  color: var(--cv-page-text, #1f2937);
  border: 1px solid rgba(15, 23, 42, 0.18);
}

.cv-layout * {
  box-sizing: border-box;
}

.cv-layout::before,
.cv-layout::after,
.cv-wave {
  content: '';
  position: absolute;
  z-index: 0;
  pointer-events: none;
}

.cv-layout::before {
  top: -108px;
  left: -54px;
  width: 420px;
  height: 390px;
  border-radius: 48% 52% 58% 42%;
  background: var(--cv-primary, #201a1c);
  box-shadow:
    34px 20px 0 14px var(--cv-secondary, #fb8500),
    72px 54px 0 22px #fff;
}

.cv-layout::after {
  top: -36px;
  right: -54px;
  width: 260px;
  height: 290px;
  border-radius: 50%;
  border: 22px solid var(--cv-secondary, #fb8500);
  box-shadow:
    -34px 26px 0 -4px #fff,
    -66px 54px 0 2px var(--cv-secondary, #fb8500),
    -104px 85px 0 -8px #fff;
}

.cv-wave--top-left {
  top: 138px;
  left: -36px;
  width: 405px;
  height: 170px;
  border-radius: 0 0 80% 0;
  background: var(--cv-secondary, #fb8500);
  transform: skewY(-4deg);
}

.cv-wave--center {
  top: 315px;
  right: 58px;
  width: 260px;
  height: 245px;
  border-radius: 48% 52% 50% 50%;
  background: var(--cv-primary, #201a1c);
  box-shadow:
    58px -36px 0 26px var(--cv-secondary, #fb8500),
    98px -76px 0 32px #fff;
}

.cv-wave--right {
  top: 430px;
  right: -92px;
  width: 285px;
  height: 190px;
  border-radius: 50%;
  background: var(--cv-secondary, #fb8500);
}

.cv-wave--bottom {
  left: -20px;
  bottom: -58px;
  width: 50%;
  height: 118px;
  border-radius: 50% 50% 0 0;
  background: var(--cv-secondary, #fb8500);
  box-shadow: 0 -18px 0 var(--cv-primary, #201a1c);
}

.cv-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(
      230px,
      var(--cv-aside-width, 272px)
    );
  gap: 36px;
  min-height: 1123px;
  padding: 38px 34px 44px 42px;
}

.cv-left,
.cv-aside-panel {
  min-width: 0;
}

.cv-header {
  min-height: 166px;
  max-width: 58%;
  display: flex;
  align-items: flex-start;
  color: var(--cv-primary, #201a1c);
}

.cv-left :deep(.cv-sections-list) {
  grid-template-columns: 1fr;
  gap: 18px;
  margin-top: 116px;
}

.cv-aside-panel {
  padding-top: 172px;
  color: var(--cv-primary, #201a1c);
}

.cv-aside-panel :deep(.cv-aside-sections) {
  gap: 22px;
}

.cv-left :deep(.cv-section-row),
.cv-aside-panel :deep(.cv-aside-section-item) {
  position: relative;
  padding: 8px 0;
}

.cv-left :deep(.cv-section-title-shell),
.cv-aside-panel :deep(.cv-section-title-shell) {
  display: inline-flex;
  min-width: min(100%, 240px);
  padding: 7px 16px;
  background: var(--cv-secondary, #fb8500) !important;
  color: #fff !important;
  border-radius: 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.12em;
  box-shadow: 10px 0 0
    color-mix(in srgb, var(--cv-secondary, #fb8500) 78%, white);
}

.cv-left :deep(.cv-section-title-shell::after),
.cv-aside-panel :deep(.cv-section-title-shell::after) {
  display: none !important;
}

.cv-left :deep(.cv-section-title-editor),
.cv-aside-panel :deep(.cv-section-title-editor) {
  text-transform: uppercase;
}

.cv-left :deep(.cv-entry),
.cv-aside-panel :deep(.cv-item),
.cv-aside-panel :deep(.cv-sec) {
  color: color-mix(in srgb, var(--cv-primary, #201a1c) 86%, #fff);
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
  align-items: flex-start;
  text-align: left;
}

.cv-header :deep(.cv-header-editor--name) {
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.cv-header :deep(.cv-header-avatar) {
  transform: none;
  box-shadow:
    0 0 0 8px #d1d5db,
    0 0 0 14px var(--cv-primary, #201a1c),
    0 0 0 18px #fff;
}

.cv-aside-panel :deep(.contact-section),
.cv-aside-panel :deep(.cv-contact-item) {
  position: relative;
}

@media (max-width: 720px) {
  .cv-grid {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .cv-header {
    max-width: none;
  }

  .cv-left :deep(.cv-sections-list) {
    margin-top: 24px;
  }

  .cv-aside-panel {
    padding-top: 24px;
  }

  .cv-header :deep(.cv-header-avatar) {
    transform: none;
  }
}
</style>
