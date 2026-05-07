<script setup lang="ts">
import { computed } from 'vue'
import type { ResumeApiItem } from '~/services/resumeApi'
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'

const props = withDefaults(
  defineProps<{
    resume: ResumeApiItem
    showTitle?: boolean
    contactStyle?: 'labels' | 'icons'
  }>(),
  { showTitle: true, contactStyle: 'labels' },
)

function getEditableResume() {
  return props.resume as ResumeApiItem & { resumeInformation?: Record<string, string> }
}

type ResumeInfoKey = NonNullable<ResumeApiItem['resumeInformation']> extends infer Info ? keyof Info & string : string

type ContactField = {
  key: string
  infoKey: ResumeInfoKey
  label: string
  icon: string
  value: string
}

const contactFields = computed<ContactField[]>(() => {
  const info = props.resume.resumeInformation
  const normalize = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

  return [
    { key: 'email', infoKey: 'email', label: 'Email', icon: 'mdi-email-outline', value: normalize(info?.email) },
    { key: 'phone', infoKey: 'phone', label: 'Phone', icon: 'mdi-phone-outline', value: normalize(info?.phone) },
    { key: 'location', infoKey: 'location', label: 'Location', icon: 'mdi-map-marker-outline', value: normalize(info?.location || info?.adresse) },
    { key: 'birthDate', infoKey: 'birthDate', label: 'Birth date', icon: 'mdi-cake-variant-outline', value: normalize(info?.birthDate) },
    { key: 'homepage', infoKey: 'homepage', label: 'Homepage', icon: 'mdi-web-outline', value: normalize(info?.homepage) },
    { key: 'repo', infoKey: 'repo_profile', label: 'Repo', icon: 'mdi-source-repository-outline', value: normalize(info?.repo_profile) },
  ].filter((field) => field.value.length > 0)
})

function ensureResumeInformation() {
  const editableResume = getEditableResume()
  if (!editableResume.resumeInformation) editableResume.resumeInformation = {}
  return editableResume.resumeInformation
}

function updateResumeInformation(key: ResumeInfoKey, value: string) {
  ensureResumeInformation()[key] = value
}
</script>

<template>
  <h3 v-if="showTitle">Contact</h3>
  <div class="contact-grid">
    <div v-for="field in contactFields" :key="field.key" class="contact-line">
      <template v-if="contactStyle === 'icons'">
        <v-icon size="16" class="mr-2">{{ field.icon }}</v-icon>
      </template>
      <template v-else>
        <strong class="label">{{ field.label }}:</strong>
      </template>
      <HoverRichTextEditor
        class="contact-line__editor"
        :model-value="field.value"
        :placeholder="field.label"
        font-size="var(--section-font-description, 0.95rem)"
        font-weight="400"
        font-family="var(--font-family, inherit)"
        color="inherit"
        @update:model-value="updateResumeInformation(field.infoKey, $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}

.contact-line {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0 0 6px;
}

.contact-line__editor {
  min-width: 0;
  flex: 1 1 auto;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.contact-line__editor :deep(.hover-editor__content p) {
  margin: 0;
}

.contact-line__editor :deep(.hover-editor__toolbar) {
  position: absolute;
  z-index: 10;
  background: color-mix(in srgb, Canvas 92%, transparent);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 18px rgba(15,23,42,.16);
}

.label {
  min-width: 82px;
  flex: 0 0 auto;
}
</style>
