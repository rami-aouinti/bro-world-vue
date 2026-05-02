<script setup lang="ts">
import { computed } from 'vue'
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHoverToolbar from '~/components/Resume/Sections/ResumeSectionHoverToolbar.vue'

const props = withDefaults(
  defineProps<{
    resume: ResumeApiItem
    showTitle?: boolean
    contactStyle?: 'labels' | 'icons'
  }>(),
  { showTitle: true, contactStyle: 'labels' },
)

type ContactField = {
  key: string
  label: string
  icon: string
  value: string
  href?: string
  displayValue?: string
}

const contactFields = computed<ContactField[]>(() => {
  const info = props.resume.resumeInformation
  const normalize = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

  return [
    { key: 'email', label: 'Email', icon: 'mdi-email-outline', value: normalize(info?.email), href: normalize(info?.email) ? `mailto:${normalize(info?.email)}` : undefined },
    { key: 'phone', label: 'Phone', icon: 'mdi-phone-outline', value: normalize(info?.phone), href: normalize(info?.phone) ? `tel:${normalize(info?.phone).replace(/\s+/g, '')}` : undefined },
    { key: 'address', label: 'Address', icon: 'mdi-map-marker-outline', value: normalize(info?.adresse) },
    { key: 'birthDate', label: 'Birth date', icon: 'mdi-cake-variant-outline', value: normalize(info?.birthDate) },
    {
      key: 'homepage',
      label: 'Homepage',
      icon: 'mdi-web',
      value: normalize(info?.homepage),
      href: normalize(info?.homepage) || undefined,
      displayValue: 'Official Website',
    },
    {
      key: 'repo',
      label: 'Repo',
      icon: 'mdi-source-repository',
      value: normalize(info?.repo_profile),
      href: normalize(info?.repo_profile) || undefined,
      displayValue: 'Link Repo',
    },
  ].filter((field) => field.value.length > 0)
})
</script>

<template>
  <h3 v-if="showTitle">Contact</h3>
  <div class="contact-grid">
    <p v-for="field in contactFields" :key="field.key" class="contact-line">
    <template v-if="contactStyle === 'icons'">
      <v-icon size="16" class="mr-2">{{ field.icon }}</v-icon>
    </template>
    <template v-else>
      <strong class="label">{{ field.label }}:</strong>
    </template>
    <a
      v-if="field.href"
      :href="field.href"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ field.displayValue || field.value }}
    </a>
    <span v-else>{{ field.value }}</span>
  </p>
  </div>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 20px;
}

.contact-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
}

.contact-line :deep(a),
.contact-line > span {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.contact-line a {
  color: inherit;
  text-decoration: none;
}

.label {
  min-width: 82px;
  flex: 0 0 auto;
}
</style>
