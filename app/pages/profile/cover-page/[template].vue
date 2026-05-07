<script setup lang="ts">
import GENERATED_COVER_PAGE_TEMPLATES from '~/data/resume-templates/generated-20-cover-page.json'
import { privateApi } from '~/utils/http/privateApi'
definePageMeta({ layout: 'profile', middleware: 'auth' })
const route = useRoute()
const item = ref<any>(null)
const loading = ref(true)
const error = ref('')
const templateName = computed(() => String(route.params.template || ''))
const activeTemplate = computed(() => GENERATED_COVER_PAGE_TEMPLATES.find((tpl: any) => tpl.name === templateName.value) || GENERATED_COVER_PAGE_TEMPLATES[0])
onMounted(async () => {
  try {
    const list = await privateApi.request<any[]>('/api/recruit/private/me/cover-pages')
    const id = String(route.query.id || '')
    item.value = list.find((entry) => entry.id === id) || list.find((entry) => entry.template?.name === templateName.value)
  } catch { error.value = 'Unable to load cover page.' } finally { loading.value = false }
})
</script>
<template><v-container><v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert><v-skeleton-loader v-else-if="loading" type="article" />
<v-card v-else class="mx-auto pa-8" max-width="900" :style="{ background: activeTemplate?.theme?.palette?.pageBackground || '#fff' }"><h1 class="text-h3 mb-1">{{ item?.fullName }}</h1><h2 class="text-h5 mb-4" :style="{ color: activeTemplate?.theme?.palette?.primary || '#0F4C81' }">{{ item?.role }}</h2><p class="text-subtitle-1 mb-3">{{ item?.header }}</p><p class="text-body-1">{{ item?.description }}</p><p class="mt-6">{{ item?.email }} · {{ item?.phone }}</p></v-card>
</v-container></template>
