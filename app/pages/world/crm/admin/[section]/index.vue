<script setup lang="ts">
definePageMeta({ layout: 'crm', title: 'CRM Admin Section' })

const route = useRoute()

const sectionMap = {
  companies: true,
  projects: true,
  tasks: true,
  'task-requests': true,
  sprints: true,
  billings: true,
  contacts: true,
  employees: true,
} as const

type SectionKey = keyof typeof sectionMap

const section = computed<SectionKey | null>(() => {
  const raw = String(route.params.section ?? '')
  return raw in sectionMap ? (raw as SectionKey) : null
})

if (!section.value) {
  await navigateTo('/world/crm/admin')
}
</script>

<template>
  <WorldCrmAdminSectionPage v-if="section" :section="section" />
</template>
