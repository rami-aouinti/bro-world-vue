<script setup lang="ts">
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'

withDefaults(
  defineProps<{
    sectionKey: string
    title: string
    icon: string
    iconAlternatives?: string[]
    titleStyle?: string
    fontFamily?: string
  }>(),
  {
    iconAlternatives: () => [],
    titleStyle: 'classic',
    fontFamily: undefined,
  },
)

defineEmits<{
  (event: 'update:title' | 'update:icon', value: string): void
}>()
</script>

<template>
  <div
    class="cv-section-title cv-section-title-shell"
    :class="`cv-section-title-shell--${titleStyle}`"
    :data-section-key="sectionKey"
  >
    <v-menu v-if="iconAlternatives.length">
      <template #activator="{ props }">
        <button v-bind="props" class="cv-section-title-icon-btn" type="button">
          <v-icon :icon="icon" size="16" />
        </button>
      </template>

      <v-list density="compact">
        <v-list-item
          v-for="altIcon in iconAlternatives"
          :key="altIcon"
          :title="altIcon"
          @click="$emit('update:icon', altIcon)"
        >
          <template #prepend>
            <v-icon :icon="altIcon" size="16" />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
    <button v-else class="cv-section-title-icon-btn" type="button">
      <v-icon :icon="icon" size="16" />
    </button>

    <HoverRichTextEditor
      class="cv-section-title-editor"
      :model-value="title"
      font-size="13px"
      font-weight="700"
      :font-family="fontFamily"
      color="inherit"
      @update:model-value="$emit('update:title', $event)"
    />
  </div>
</template>

<style scoped>
.cv-section-title-shell {
  --section-accent: var(--cv-secondary, #c8a24a);
  --section-primary: var(--cv-primary, #12324a);
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 28px;
  margin-bottom: 8px;
  color: var(--cv-page-text, #0f172a);
}

.cv-section-title-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  min-width: 20px;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.cv-section-title-icon-btn:hover,
.cv-section-title-icon-btn:focus-visible {
  background: color-mix(in srgb, currentColor 10%, transparent);
  outline: none;
}

.cv-section-title-shell--classic {
  font-weight: 700;
}

.cv-section-title-shell--pill-filled {
  width: min(280px, 100%);
  justify-content: center;
  padding: 5px 18px;
  border-radius: 999px;
  background: var(--section-accent);
  color: #fff;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.cv-section-title-shell--pill-outline {
  width: min(280px, 100%);
  justify-content: center;
  padding: 5px 18px;
  border: 2px solid var(--section-accent);
  border-radius: 999px;
  color: var(--section-accent);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.cv-section-title-shell--icon-bar {
  width: 100%;
  gap: 0;
  background: var(--section-accent);
  color: #fff;
  font-weight: 800;
  text-transform: uppercase;
}

.cv-section-title-shell--icon-bar .cv-section-title-icon-btn {
  width: 44px;
  height: 44px;
  min-width: 44px;
  margin-right: 8px;
  border-radius: 999px;
  background: var(--section-accent);
  transform: translateX(-8px);
  color: #fff;
}

.cv-section-title-shell--ribbon {
  padding: 5px 16px;
  background: color-mix(
    in srgb,
    var(--section-primary) 72%,
    var(--section-accent)
  );
  color: #fff;
  font-size: 11px;
  text-transform: uppercase;
  position: relative;
}

.cv-section-title-shell--tab {
  padding: 4px 14px;
  background: var(--section-primary);
  color: #fff;
  border-radius: 2px;
  text-transform: uppercase;
}

.cv-section-title-shell--hexagon-icon {
  padding: 4px 16px 4px 8px;
  background: var(--section-primary);
  color: #fff;
  border-radius: 999px;
  text-transform: uppercase;
}

.cv-section-title-shell--hexagon-icon .cv-section-title-icon-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  margin-left: -12px;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: #fff;
  color: var(--section-primary);
  border: 3px solid var(--section-accent);
}

.cv-section-title-editor {
  position: relative;
  display: inline-block;
  min-width: 0;
  max-width: 100%;
  color: inherit;
}

.cv-section-title-editor :deep(.hover-editor__content p) {
  margin: 0;
}

.cv-section-title-editor :deep(.hover-editor__toolbar) {
  position: absolute;
  top: auto;
  bottom: calc(100% - 1px);
  left: 0;
  z-index: 2400;
  width: max-content;
  max-width: min(560px, 92vw);
  margin-bottom: 0;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
}

.cv-section-title-editor :deep(.toolbar-size) {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border-color: color-mix(
    in srgb,
    rgb(var(--v-theme-on-surface)) 22%,
    transparent
  );
}

.cv-section-title-editor :deep(.v-btn) {
  color: rgb(var(--v-theme-on-surface));
}
</style>
