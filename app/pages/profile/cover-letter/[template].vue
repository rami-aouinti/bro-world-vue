<script setup lang="ts">
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'
import { privateApi } from '~/utils/http/privateApi'
definePageMeta({ layout: 'profile', middleware: 'auth' })
const route = useRoute()
const item = ref<any>(null)
const loading = ref(true)
const error = ref('')
const templateName = computed(() => String(route.params.template || ''))
const activeTemplate = computed(() => GENERATED_COVER_LETTER_TEMPLATES.find((tpl: any) => tpl.name === templateName.value) || GENERATED_COVER_LETTER_TEMPLATES[0])
onMounted(async () => {
  try {
    const list = await privateApi.request<any[]>('/api/recruit/private/me/cover-letters')
    const id = String(route.query.id || '')
    item.value = list.find((entry) => entry.id === id) || list.find((entry) => entry.template?.name === templateName.value)
  } catch { error.value = 'Unable to load cover letter.' } finally { loading.value = false }
})
</script>
<template><v-container><v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert><v-skeleton-loader v-else-if="loading" type="article" />
<v-card v-else class="mx-auto pa-8" max-width="900" :style="{ background: activeTemplate?.theme?.palette?.pageBackground || '#fff' }"><div class="d-flex justify-space-between mb-6"><div><h1 class="text-h4">{{ item?.fullName }}</h1><p>{{ item?.role }}</p></div><div class="text-right"><p>{{ item?.location }}</p><p>{{ item?.senderDate }}</p></div></div><h2 class="text-h6 mb-4" :style="{ color: activeTemplate?.theme?.palette?.primary || '#BE123C' }">{{ item?.header }}</h2><p class="mb-4">{{ item?.description1 }}</p><p>{{ item?.description2 }}</p></v-card>
</v-container></template>
