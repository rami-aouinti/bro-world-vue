<template>
  <div class="cv-layout cv-layout--impact-ribbon-left">
    <div class="cv-blob cv-blob--photo" />
    <div class="cv-blob cv-blob--mid" />
    <div class="cv-blob cv-blob--bottom" />
    <div class="cv-ribbon cv-ribbon--contact" />

    <section class="cv-shell">
      <aside class="cv-aside-panel"><slot name="aside" /></aside>
      <main class="cv-body">
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
  background: var(--cv-page-background, #ffffff);
  color: var(--cv-page-text, #111827);
  border: 1px solid rgba(15, 23, 42, 0.18);
}

.cv-layout::before,
.cv-layout::after,
.cv-blob,
.cv-ribbon {
  content: '';
  position: absolute;
  z-index: 0;
  pointer-events: none;
}

.cv-layout::before {
  inset: 0 auto 0 0;
  width: 36%;
  background: var(--cv-primary, #111827);
}

.cv-layout::after {
  top: -115px;
  left: -78px;
  width: 455px;
  height: 455px;
  border-radius: 50%;
  background: var(--cv-secondary, #ef233c);
  transform: rotate(-8deg);
}

.cv-blob--photo {
  top: -78px;
  left: -108px;
  width: 355px;
  height: 455px;
  border-radius: 47% 42% 58% 52%;
  background: var(--cv-primary, #111827);
  box-shadow:
    92px 44px 0 -6px var(--cv-primary, #111827),
    118px 52px 0 18px var(--cv-secondary, #ef233c),
    148px 78px 0 44px rgba(255, 255, 255, 0.98);
}

.cv-blob--mid {
  left: -96px;
  top: 344px;
  width: 340px;
  height: 300px;
  border-radius: 44% 36% 58% 42%;
  background: var(--cv-primary, #111827);
  box-shadow: 80px 44px 0 36px var(--cv-secondary, #ef233c);
}

.cv-blob--bottom {
  left: -115px;
  bottom: -190px;
  width: 430px;
  height: 510px;
  border-radius: 50%;
  background: var(--cv-primary, #111827);
  box-shadow: 95px -18px 0 50px var(--cv-secondary, #ef233c);
}

.cv-ribbon--contact {
  top: 252px;
  left: 0;
  width: 342px;
  height: 145px;
  background: var(--cv-secondary, #ef233c);
  clip-path: polygon(0 0, 83% 12%, 100% 50%, 83% 88%, 0 100%);
  box-shadow: 0 16px 0
    color-mix(in srgb, var(--cv-secondary, #ef233c) 74%, #111827);
}

.cv-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(236px, var(--cv-aside-width, 292px)) minmax(
      0,
      1fr
    );
  min-height: 1123px;
}

.cv-aside-panel {
  min-width: 0;
  padding: 248px 28px 34px 28px;
  color: #fff;
}

.cv-body {
  min-width: 0;
  padding: 64px 44px 44px 34px;
}

.cv-header {
  min-height: 142px;
  display: flex;
  align-items: center;
  color: var(--cv-primary, #111827);
}

.cv-main {
  position: relative;
}

.cv-aside-panel :deep(.cv-aside-sections) {
  gap: 26px;
}

.cv-aside-panel :deep(.cv-aside-section-item) {
  position: relative;
  padding: 8px 0;
  color: #fff;
}

.cv-aside-panel :deep(.cv-section-title-shell) {
  width: 100%;
  justify-content: flex-start;
  padding: 0 0 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.68);
  background: transparent !important;
  color: #fff !important;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.cv-aside-panel :deep(.cv-section-title-shell::after) {
  display: none !important;
}

.cv-main :deep(.cv-sections-list) {
  grid-template-columns: 1fr;
  gap: 16px;
}

.cv-main :deep(.cv-section-row) {
  padding: 0 0 4px 40px;
  margin-bottom: 8px;
}

.cv-main :deep(.cv-section-row::before) {
  content: '';
  position: absolute;
  left: 5px;
  top: 34px;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--cv-secondary, #ef233c);
  transform: rotate(45deg);
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.85);
}

.cv-main :deep(.cv-section-row::after) {
  content: '';
  position: absolute;
  left: 14px;
  top: 54px;
  bottom: 0;
  width: 1px;
  background: rgba(15, 23, 42, 0.2);
}

.cv-main :deep(.cv-section-title-shell) {
  width: 100%;
  padding: 7px 0 9px;
  border-bottom: 2px solid
    color-mix(in srgb, var(--cv-primary, #111827) 56%, transparent);
  background: transparent !important;
  color: var(--cv-secondary, #ef233c) !important;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.09em;
}

.cv-main :deep(.cv-section-title-editor) {
  padding: 5px 12px;
  border: 2px solid color-mix(in srgb, var(--cv-secondary, #ef233c) 70%, white);
  background: #fff;
}

.cv-main :deep(.cv-section-title-shell::after) {
  display: none !important;
}

.cv-header :deep(.cv-header-layout) {
  width: 100%;
}

.cv-header :deep(.cv-header-contact-grid) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.cv-header :deep(.cv-header-identity) {
  align-items: flex-start;
  text-align: left;
}

.cv-header :deep(.cv-header-editor--name) {
  text-transform: uppercase;
  letter-spacing: 0.28em;
}

.cv-header :deep(.cv-header-editor--role) {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cv-header :deep(.cv-header-avatar) {
  box-shadow:
    0 0 0 8px #fff,
    0 0 0 14px var(--cv-secondary, #ef233c),
    0 0 0 18px var(--cv-primary, #111827);
}

@media (max-width: 720px) {
  .cv-layout::before {
    width: 100%;
    opacity: 0.12;
  }

  .cv-shell {
    grid-template-columns: 1fr;
  }

  .cv-aside-panel {
    padding: 170px 22px 18px;
    color: var(--cv-primary, #111827);
  }

  .cv-body {
    padding: 24px;
  }
}
</style>
