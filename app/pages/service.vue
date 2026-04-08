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
          <v-list-subheader class="text-overline">{{ t('pages.service.leftNav.title') }}</v-list-subheader>
          <v-list-item
            prepend-icon="mdi-magnify-scan"
            :title="t('pages.service.leftNav.auditTitle')"
            :subtitle="t('pages.service.leftNav.auditSubtitle')"
          />
          <v-list-item
            prepend-icon="mdi-account-group"
            :title="t('pages.service.leftNav.supportTitle')"
            :subtitle="t('pages.service.leftNav.supportSubtitle')"
          />
          <v-list-item
            prepend-icon="mdi-school"
            :title="t('pages.service.leftNav.workshopsTitle')"
            :subtitle="t('pages.service.leftNav.workshopsSubtitle')"
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
                <v-card-title class="text-subtitle-1">{{ t('pages.service.rightNav.auditTitle') }}</v-card-title>
                <v-card-subtitle>{{ t('pages.service.rightNav.auditSubtitle') }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                {{ t('pages.service.rightNav.auditDescription') }}
              </v-card-text>
            </v-card>
          </v-list-item>
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="warning">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-account-group" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1">{{ t('pages.service.rightNav.supportTitle') }}</v-card-title>
                <v-card-subtitle>{{ t('pages.service.rightNav.supportSubtitle') }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                {{ t('pages.service.rightNav.supportDescription') }}
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
        <p>{{ t('pages.service.description') }}</p>
      </template>
    </v-container>
  </div>
</template>
