<script setup lang="ts">
const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'appbar.about',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <v-list v-else nav density="compact" class="app-left-drawer-list">
          <v-list-subheader class="text-overline">À propos</v-list-subheader>
          <v-list-item prepend-icon="mdi-information-outline" title="Présentation" subtitle="Qui sommes-nous ?" />
          <v-list-item prepend-icon="mdi-bullseye-arrow" title="Mission" subtitle="Notre objectif" />
          <v-list-item prepend-icon="mdi-hand-heart" title="Valeurs" subtitle="Notre engagement" />
        </v-list>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible" />
        <v-list v-else nav density="compact" class="app-right-drawer-list">
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="primary">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-bullseye-arrow" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1">Notre mission</v-card-title>
                <v-card-subtitle>Donner de la clarté</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                Nous aidons les équipes à transformer des idées complexes en actions simples et mesurables.
              </v-card-text>
            </v-card>
          </v-list-item>
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="success">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-hand-heart" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1">Nos valeurs</v-card-title>
                <v-card-subtitle>Transparence et impact</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                Nous privilégions une communication honnête, la collaboration et des résultats utiles au quotidien.
              </v-card-text>
            </v-card>
          </v-list-item>
        </v-list>
      </template>
    </AppPageDrawers>

    <v-container class="py-12 text-center">
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <h1 class="text-h3 mb-4">{{ t('appbar.about') }}</h1>
        <p>En savoir plus sur notre équipe, notre mission et nos valeurs.</p>
      </template>
    </v-container>
  </div>
</template>
