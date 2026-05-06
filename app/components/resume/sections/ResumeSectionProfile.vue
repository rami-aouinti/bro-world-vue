<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'

const props = withDefaults(
  defineProps<{
    resume: ResumeApiItem
    showTitle?: boolean
  }>(),
  { showTitle: true },
)

function getEditableResume() {
  return props.resume as ResumeApiItem & { resumeInformation?: Record<string, string> }
}

function ensureResumeInformation() {
  const editableResume = getEditableResume()
  if (!editableResume.resumeInformation) editableResume.resumeInformation = {}
  return editableResume.resumeInformation
}

function updateProfileText(value: string) {
  ensureResumeInformation().profileText = value
}
</script>

<template>
  <h3 v-if="showTitle">Profile</h3>
  <HoverRichTextEditor
    class="profile-text-editor"
    :model-value="resume.resumeInformation?.profileText || ''"
    placeholder="Profile summary"
    font-size="var(--section-font-description, 0.95rem)"
    font-weight="400"
    font-family="var(--font-family, inherit)"
    color="inherit"
    @update:model-value="updateProfileText"
  />
</template>

<style scoped>
.profile-text-editor {
  white-space: pre-line;
}

.profile-text-editor :deep(.hover-editor__content p) {
  margin: 0;
}

.profile-text-editor :deep(.hover-editor__toolbar) {
  position: absolute;
  z-index: 10;
  background: color-mix(in srgb, Canvas 92%, transparent);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 18px rgba(15,23,42,.16);
}
</style>
