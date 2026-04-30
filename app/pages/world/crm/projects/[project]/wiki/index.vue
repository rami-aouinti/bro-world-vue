<script setup lang="ts">
import type { CrmProjectItem } from '~~/server/types/api/crm-general'

type ProjectWikiPage = {
  id: string
  title?: string
  content?: string
  createdAt?: string | null
}

definePageMeta({ layout: 'crm', title: 'CRM Project Wiki' })

const route = useRoute()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()

const projectId = computed(() => String(route.params.project ?? ''))
const selectedWikiId = computed(() => String(route.query.wiki ?? ''))

const { data, pending, error } = await useFetch<CrmProjectItem>(
  () => `/api/crm/general/projects/${projectId.value}`,
)

const wikiPages = computed<ProjectWikiPage[]>(() =>
  Array.isArray(data.value?.wikiPages)
    ? (data.value?.wikiPages as ProjectWikiPage[])
    : [],
)

const selectedWiki = computed(() => {
  if (!wikiPages.value.length) return null
  return (
    wikiPages.value.find((page) => page.id === selectedWikiId.value) ||
    wikiPages.value[0] ||
    null
  )
})

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.actions.createLead')"
      action-icon="mdi-account-plus-outline"
    >
      <template #right>
        <h3 class="text-subtitle-1 mb-3">Wiki pages</h3>
        <v-list
          v-if="wikiPages.length"
          density="compact"
          bg-color="transparent"
        >
          <v-list-item
            v-for="page in wikiPages"
            :key="page.id"
            :title="page.title || page.id"
            :subtitle="formatDate(page.createdAt)"
            :to="`/world/crm/projects/${projectId}/wiki?wiki=${encodeURIComponent(page.id)}`"
            :active="selectedWiki?.id === page.id"
            color="primary"
          />
        </v-list>
        <p v-else class="text-body-2 text-medium-emphasis mb-0">
          Aucune page wiki.
        </p>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="detail" />
      <v-alert v-else-if="error" type="error" variant="tonal"
        >Impossible de charger le wiki du projet.</v-alert
      >
      <v-card v-else rounded="xl" class="pa-4 postcard-gradient-card">
        <div class="d-flex justify-space-between align-start ga-2 mb-3">
          <div>
            <h2 class="text-h6 mb-1">
              {{ selectedWiki?.title || 'Wiki du projet' }}
            </h2>
            <p class="text-caption mb-0 text-medium-emphasis">
              {{ selectedWiki ? formatDate(selectedWiki.createdAt) : '—' }}
            </p>
          </div>
          <v-btn
            size="small"
            variant="text"
            color="primary"
            :to="`/world/crm/projects/${projectId}?mode=view`"
          >
            Retour projet
          </v-btn>
        </div>

        <v-divider class="mb-4" />

        <p
          v-if="selectedWiki?.content"
          class="text-body-1"
          style="white-space: pre-wrap"
        >
          {{ selectedWiki.content }}
        </p>
        <p v-else class="text-body-2 text-medium-emphasis mb-0">
          Aucun contenu wiki pour ce projet.
        </p>
      </v-card>
    </v-container>
  </div>
</template>
