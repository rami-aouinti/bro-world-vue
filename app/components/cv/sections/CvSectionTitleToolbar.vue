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
  (
    event: 'update:title' | 'update:icon' | 'update:titleStyle',
    value: string,
  ): void
}>()
</script>

<template>
  <div
    class="cv-section-title cv-section-title-shell"
    :class="`cv-section-title-shell--${titleStyle}`"
    :data-section-key="sectionKey"
  >
    <v-menu>
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
  display: flex !important;
  align-items: center;
  gap: 4px;
  min-width: 0;
  font-weight: 700;
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
