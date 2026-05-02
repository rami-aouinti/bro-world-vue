<template>
  <section class="resume-hover-section">
    <div class="resume-hover-section__header">
      <slot name="title" />
      <span class="resume-hover-section__toolbar" role="toolbar" aria-label="Section actions">
        <button type="button" class="resume-hover-section__tool-btn" aria-label="Add section">
          <v-icon icon="mdi-plus" size="14" />
        </button>
        <button type="button" class="resume-hover-section__tool-btn" aria-label="Remove section">
          <v-icon icon="mdi-minus" size="14" />
        </button>
      </span>
    </div>
    <slot />
  </section>
</template>

<style scoped>
.resume-hover-section {
  display: grid;
  gap: 8px;
}

.resume-hover-section__header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.resume-hover-section__toolbar {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-4px);
  transition: opacity .15s ease, transform .15s ease;
}

.resume-hover-section:hover .resume-hover-section__toolbar,
.resume-hover-section:focus-within .resume-hover-section__toolbar {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.resume-hover-section__tool-btn {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
  color: inherit;
  background: color-mix(in srgb, currentColor 10%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;
}

.resume-hover-section__tool-btn:hover {
  background: color-mix(in srgb, currentColor 18%, transparent);
  transform: translateY(-1px);
}
</style>
