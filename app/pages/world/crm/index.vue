<script setup lang="ts">
import { useWorldCrmNavItems } from '~/composables/useWorldCrmNavItems'

definePageMeta({
  title: 'world.crm.label',
})

const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()

const documentationSections = [
  {
    title: 'Projects',
    icon: 'mdi-folder-multiple-outline',
    description:
      'La page Projects centralise les projets CRM, leur statut, le provisioning et la visibilité des repositories GitHub.',
    to: '/world/crm/projects',
  },
  {
    title: 'Kanaban',
    icon: 'mdi-view-kanban-outline',
    description:
      'La page Kanaban permet de piloter le delivery au quotidien avec les colonnes opérationnelles et le suivi de sprint.',
    to: '/world/crm/kanaban',
  },
  {
    title: 'Tasks',
    icon: 'mdi-format-list-checks',
    description:
      'La page Tasks gère les tâches parent/enfant, priorités, échéances, assignation et progression par équipe.',
    to: '/world/crm/tasks',
  },
  {
    title: 'Task Requests',
    icon: 'mdi-source-pull',
    description:
      'La page Task Requests formalise les demandes techniques liées aux tâches, y compris la connexion aux branches GitHub.',
    to: '/world/crm/task-requests',
  },
]

const adminHighlights = [
  'Gouvernance des référentiels (companies, projects, sprints, task requests).',
  'Supervision des rôles et droits d’accès pour sécuriser les opérations CRM.',
  'Contrôle qualité des statuts, standards de naming et cycle de vie des données.',
]

const githubSyncSteps = [
  '1. Vérifier que le projet est en provisioning ready et qu’il a des repositories GitHub.',
  '2. Ouvrir la page Repositories et valider les dépôts rattachés.',
  '3. Depuis GitHub Sync, charger les repositories et sélectionner la branche cible.',
  '4. Créer ou lier les branches depuis Task Requests pour connecter exécution produit et code.',
  '5. Suivre les jobs de synchronisation et confirmer la traçabilité PR/commit dans le CRM.',
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      action-label="Create Crm"
      action-icon="mdi-plus-circle-outline"
      @action="navigateTo('/platform/crm/new')"
    >
      <template #right />
    </WorldModuleDrawers>

    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card rounded="xl" class="pa-6 postcard-gradient-card crm-doc-hero">
            <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
              <div>
                <h1 class="text-h5 font-weight-bold mb-2">CRM Documentation Hub</h1>
                <p class="text-body-1 mb-0">
                  Documentation complète du CRM World avec navigation guidée, synchronisation GitHub,
                  gouvernance admin et onboarding opérationnel.
                </p>
              </div>
              <v-btn color="primary" prepend-icon="mdi-rocket-launch-outline" @click="navigateTo('/platform/crm/new')">
                Create Crm
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col v-for="section in documentationSections" :key="section.title" cols="12" md="6">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card crm-doc-card h-100">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon :icon="section.icon" color="primary" />
              <h2 class="text-h6 mb-0">{{ section.title }}</h2>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ section.description }}</p>
            <v-btn color="primary" variant="tonal" append-icon="mdi-arrow-right" :to="section.to">
              Ouvrir {{ section.title }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card crm-doc-card h-100">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon icon="mdi-shield-account-outline" color="secondary" />
              <h2 class="text-h6 mb-0">Administration CRM</h2>
            </div>
            <v-list class="bg-transparent" density="comfortable">
              <v-list-item v-for="item in adminHighlights" :key="item" :title="item" prepend-icon="mdi-check-circle-outline" />
            </v-list>
            <v-btn class="mt-2" color="secondary" variant="tonal" append-icon="mdi-arrow-right" to="/world/crm/admin">
              Aller à l’administration
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card rounded="xl" class="pa-5 postcard-gradient-card crm-doc-card h-100">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon icon="mdi-github" color="primary" />
              <h2 class="text-h6 mb-0">Synchronisation GitHub: étapes</h2>
            </div>
            <v-timeline side="end" density="compact" class="crm-sync-timeline">
              <v-timeline-item
                v-for="step in githubSyncSteps"
                :key="step"
                dot-color="primary"
                fill-dot
                size="small"
              >
                <div class="text-body-2">{{ step }}</div>
              </v-timeline-item>
            </v-timeline>
            <div class="d-flex ga-2 flex-wrap mt-2">
              <v-btn color="primary" variant="tonal" append-icon="mdi-arrow-right" to="/world/crm/repositories">
                Repositories
              </v-btn>
              <v-btn color="primary" variant="tonal" append-icon="mdi-arrow-right" to="/world/crm/github-sync">
                GitHub Sync
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.crm-doc-hero {
  position: relative;
  overflow: hidden;
}

.crm-doc-hero::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  top: -140px;
  right: -110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.2) 0%, transparent 70%);
  animation: crmGlow 8s ease-in-out infinite;
}

.crm-doc-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: crmCardIn 0.45s ease both;
}

.crm-doc-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
}

.crm-sync-timeline {
  max-height: 260px;
  overflow: auto;
}

@keyframes crmGlow {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(24px);
  }
}

@keyframes crmCardIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
