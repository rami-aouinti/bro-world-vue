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
          <v-list-subheader class="text-overline">{{ t('pages.about.leftNav.title') }}</v-list-subheader>
          <v-list-item
            prepend-icon="mdi-information-outline"
            :title="t('pages.about.leftNav.overviewTitle')"
            :subtitle="t('pages.about.leftNav.overviewSubtitle')"
          />
          <v-list-item
            prepend-icon="mdi-bullseye-arrow"
            :title="t('pages.about.leftNav.missionTitle')"
            :subtitle="t('pages.about.leftNav.missionSubtitle')"
          />
          <v-list-item
            prepend-icon="mdi-hand-heart"
            :title="t('pages.about.leftNav.valuesTitle')"
            :subtitle="t('pages.about.leftNav.valuesSubtitle')"
          />
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
                <v-card-title class="text-subtitle-1">{{ t('pages.about.rightNav.missionTitle') }}</v-card-title>
                <v-card-subtitle>{{ t('pages.about.rightNav.missionSubtitle') }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                {{ t('pages.about.rightNav.missionDescription') }}
              </v-card-text>
            </v-card>
          </v-list-item>
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="success">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-hand-heart" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1">{{ t('pages.about.rightNav.valuesTitle') }}</v-card-title>
                <v-card-subtitle>{{ t('pages.about.rightNav.valuesSubtitle') }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                {{ t('pages.about.rightNav.valuesDescription') }}
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
        <p>{{ t('pages.about.description') }}</p>
      </template>
    </v-container>
  </div>
</template>
