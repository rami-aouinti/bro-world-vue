<script setup lang="ts">
import { ADMIN_SECTIONS_BY_KEY, type AdminSectionKey } from '~/constants/adminManagement'

const route = useRoute()
const sectionKey = computed(() => route.params.section as AdminSectionKey)
const section = computed(() => ADMIN_SECTIONS_BY_KEY[sectionKey.value])

if (!section.value) {
  throw createError({ statusCode: 404, statusMessage: 'Admin section not found' })
}

if (sectionKey.value === 'pages') {
  await navigateTo('/admin/pages/home', { redirectCode: 302 })
}
</script>

<template>
  <div>
    <AdminModuleDrawers />
    <AdminSectionManagementView :section-key="sectionKey" />
  </div>
</template>
