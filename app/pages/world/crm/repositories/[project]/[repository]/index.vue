<script setup lang="ts">
definePageMeta({ layout: 'crm', title: 'CRM Repository Detail' })

const route = useRoute()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const encodedRepository = computed(() => encodeURIComponent(repository.value))

const pages = computed(() => [
  {
    title: t('world.crm.repositories.sections.commits', 'Commits'),
    description: 'Lister les commits et voir les détails (SHA, fichiers, auteur).',
    icon: 'mdi-source-commit',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/commits`,
  },
  {
    title: t('world.crm.repositories.sections.pullRequests', 'Pull requests'),
    description: 'Lister les PRs et afficher les informations détaillées.',
    icon: 'mdi-source-pull',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/pull-requests`,
  },
  {
    title: t('world.crm.repositories.sections.branches', 'Branches'),
    description: 'Lister les branches et consulter les métadonnées disponibles.',
    icon: 'mdi-source-branch',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/branches`,
  },
  {
    title: t('world.crm.repositories.sections.workflows', 'Workflows'),
    description: 'Lister les workflows et leurs runs associés.',
    icon: 'mdi-robot',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/workflows`,
  },
  {
    title: t('world.crm.repositories.sections.itemActions', 'Actions'),
    description: 'Exécuter les actions PR/Issue/Repository avec sélecteurs.',
    icon: 'mdi-playlist-check',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/actions`,
  },
])
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription', 'Browse project repositories and GitHub dashboard data.')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.nav.repositories', 'Repositories')"
      action-icon="mdi-source-repository"
    />

    <v-container fluid>
      <v-card class="pa-4 postcard-gradient-card" rounded="xl">
        <h1 class="text-h5 mb-2">{{ repository }}</h1>
        <p class="text-body-2 text-medium-emphasis mb-4">Choisissez une sous-page pour gérer le repository proprement.</p>

        <v-row>
          <v-col v-for="page in pages" :key="page.to" cols="12" md="6" lg="4">
            <v-card variant="tonal" class="pa-4 h-100 d-flex flex-column" rounded="xl">
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon :icon="page.icon" />
                <h2 class="text-subtitle-1 mb-0">{{ page.title }}</h2>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-4">{{ page.description }}</p>
              <v-spacer />
              <v-btn :to="page.to" color="primary" variant="tonal" append-icon="mdi-arrow-right">Ouvrir</v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
