<script setup lang="ts">
const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'appbar.service',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <v-list v-else nav density="compact" class="app-left-drawer-list">
          <v-list-subheader class="text-overline">Services</v-list-subheader>
          <v-list-item
            prepend-icon="mdi-magnify-scan"
            title="Audit rapide"
            subtitle="Diagnostic en 48h"
          />
          <v-list-item
            prepend-icon="mdi-account-group"
            title="Accompagnement"
            subtitle="Suivi sur mesure"
          />
          <v-list-item
            prepend-icon="mdi-school"
            title="Ateliers"
            subtitle="Montée en compétences"
          />
        </v-list>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible" />
        <v-list v-else nav density="compact" class="app-right-drawer-list">
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="info">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-magnify-scan" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1"
                  >Audit rapide</v-card-title
                >
                <v-card-subtitle>En 48h</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                Analyse de vos besoins et recommandations priorisées pour
                démarrer rapidement.
              </v-card-text>
            </v-card>
          </v-list-item>
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="warning">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-account-group" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1"
                  >Accompagnement</v-card-title
                >
                <v-card-subtitle>Sur mesure</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                Suivi régulier, ateliers pratiques et feuille de route adaptée à
                votre équipe.
              </v-card-text>
            </v-card>
          </v-list-item>
        </v-list>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <h1 class="text-h3 mb-4">{{ t('appbar.service') }}</h1>
        <p>Découvrez nos services et comment nous pouvons vous accompagner.</p>
      </template>
    </v-container>
  </div>
</template>
