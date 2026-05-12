<template>
  <div class="cv-layout cv-layout--pro-curve-left">
    <div class="cv-layout__ambient cv-layout__ambient--top" />
    <div class="cv-layout__ambient cv-layout__ambient--bottom" />

    <header class="cv-header">
      <div class="cv-header__dark-panel" />
      <div class="cv-header__accent-swoosh" />
      <div class="cv-header__accent-swoosh cv-header__accent-swoosh--shadow" />
      <div class="cv-header__content"><slot name="header" /></div>
    </header>

    <section class="cv-content">
      <aside class="cv-aside-panel"><slot name="aside" /></aside>
      <main class="cv-main"><slot name="content" /></main>
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
    linear-gradient(90deg, var(--cv-primary, #101827) 0 30%, transparent 30%),
    var(--cv-page-background, #f8fafc);
  color: var(--cv-page-text, #111827);
  border: 1px solid rgba(148, 163, 184, 0.42);
}

.cv-layout * {
  box-sizing: border-box;
}

.cv-layout__ambient {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  border-radius: 999px;
}

.cv-layout__ambient--top {
  top: -72px;
  right: -54px;
  width: 270px;
  height: 170px;
  background: color-mix(in srgb, var(--cv-secondary, #f97316) 20%, white);
}

.cv-layout__ambient--bottom {
  left: 19%;
  bottom: -70px;
  width: 190px;
  height: 190px;
  background: color-mix(in srgb, var(--cv-secondary, #f97316) 16%, transparent);
}

.cv-header {
  position: relative;
  z-index: 1;
  min-height: 188px;
  padding: 30px 34px 28px calc(var(--cv-aside-width, 252px) + 24px);
  color: #fff;
}

.cv-header__dark-panel,
.cv-header__accent-swoosh,
.cv-header__content {
  position: absolute;
}

.cv-header__dark-panel {
  inset: 0 auto 0 0;
  width: calc(var(--cv-aside-width, 252px) + 62px);
  background: var(--cv-primary, #101827);
  border-bottom-right-radius: 70% 86px;
}

.cv-header__accent-swoosh {
  z-index: 1;
  top: 0;
  right: 0;
  width: 68%;
  height: 136px;
  background: var(--cv-secondary, #f97316);
  border-bottom-left-radius: 210px 92px;
  border-bottom-right-radius: 64px;
  box-shadow: 0 18px 0
    color-mix(in srgb, var(--cv-secondary, #f97316) 14%, white);
}

.cv-header__accent-swoosh--shadow {
  z-index: 0;
  top: 126px;
  right: 0;
  height: 36px;
  background: color-mix(in srgb, var(--cv-primary, #101827) 8%, white);
  box-shadow: none;
}

.cv-header__content {
  position: relative;
  z-index: 2;
  min-height: 128px;
  display: flex;
  align-items: center;
}

.cv-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(220px, var(--cv-aside-width, 252px)) minmax(
      0,
      1fr
    );
  gap: 20px;
  padding: 0 26px 32px 0;
}

.cv-aside-panel {
  position: relative;
  min-height: calc(1123px - 188px);
  padding: 18px 16px 34px 18px;
  color: #fff;
  background: var(--cv-primary, #101827);
  border-bottom-right-radius: 58px;
}

.cv-aside-panel::after {
  content: '';
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 42%;
  height: 170px;
  background: var(--cv-page-background, #f8fafc);
  border-top-left-radius: 100% 240px;
}

.cv-aside-panel :deep(.cv-aside-sections) {
  position: relative;
  z-index: 1;
  gap: 14px;
}

.cv-aside-panel :deep(.cv-aside-section-item) {
  padding: 8px 0;
}

.cv-aside-panel :deep(.cv-section-title-shell) {
  min-width: min(100%, 190px);
  justify-content: center;
  padding: 5px 14px;
  border-radius: 999px;
  background: var(--cv-secondary, #f97316);
  color: var(--cv-primary, #101827) !important;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.cv-aside-panel :deep(.cv-section-title-shell::after) {
  display: none !important;
}

.cv-main {
  min-width: 0;
  padding: 0 0 0 8px;
}

.cv-main :deep(.cv-sections-list) {
  gap: 10px 14px;
}

.cv-main :deep(.cv-section-row) {
  padding: 4px 0 8px;
}

.cv-main :deep(.cv-section-title-shell) {
  min-width: min(100%, 330px);
  padding: 5px 18px 5px 36px;
  border-radius: 999px 0 0 999px;
  background: linear-gradient(
    90deg,
    var(--cv-secondary, #f97316),
    color-mix(in srgb, var(--cv-secondary, #f97316) 20%, white)
  );
  color: var(--cv-primary, #101827) !important;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.055em;
}

.cv-main :deep(.cv-section-title-shell::after) {
  display: none !important;
}

.cv-main :deep(.cv-section-title-icon-btn) {
  margin-left: -28px;
  color: var(--cv-primary, #101827) !important;
}

.cv-header :deep(.cv-header-layout) {
  width: 100%;
  color: #fff;
}

.cv-header :deep(.cv-header-layout--header-right),
.cv-header :deep(.cv-header-layout--header-left) {
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr);
}

.cv-header :deep(.cv-header-identity) {
  align-items: flex-start;
  text-align: left;
  color: #fff;
}

.cv-header :deep(.cv-header-editor--name) {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cv-header :deep(.cv-header-contact-grid) {
  grid-template-columns: 1fr;
  max-width: 245px;
  margin-left: auto;
}

.cv-header :deep(.cv-contact-item) {
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
}

.cv-header :deep(.cv-header-avatar) {
  box-shadow:
    0 0 0 6px color-mix(in srgb, var(--cv-secondary, #f97316) 72%, white),
    0 0 0 10px rgba(255, 255, 255, 0.9);
}

.cv-aside-panel :deep(.cv-aside-section-item--contact) {
  margin: 8px 4px 18px 0;
  padding: 14px 14px 12px;
  border-radius: 24px;
  background: color-mix(in srgb, var(--cv-secondary, #f97316) 92%, white);
  color: var(--cv-primary, #101827) !important;
  box-shadow: 10px 10px 0 rgba(255, 255, 255, 0.14);
}

.cv-aside-panel :deep(.cv-aside-section-item--contact .cv-section-title-shell) {
  background: rgba(255, 255, 255, 0.92) !important;
  color: var(--cv-primary, #101827) !important;
}

.cv-aside-panel :deep(.cv-aside-section-item--contact .cv-rich-item),
.cv-aside-panel :deep(.cv-aside-section-item--contact .cv-rich-editor),
.cv-aside-panel :deep(.cv-aside-section-item--contact p) {
  color: var(--cv-primary, #101827) !important;
  font-weight: 800;
}

@media (max-width: 720px) {
  .cv-layout {
    background: var(--cv-page-background, #f8fafc);
  }

  .cv-header {
    padding: 24px;
  }

  .cv-header__dark-panel {
    width: 46%;
  }

  .cv-content {
    grid-template-columns: 1fr;
    padding: 0 18px 24px;
  }

  .cv-aside-panel {
    min-height: 0;
    border-radius: 28px;
  }

  .cv-aside-panel::after {
    display: none;
  }
}
</style>
