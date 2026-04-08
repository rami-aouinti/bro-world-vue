<script setup lang="ts">
const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'appbar.contact',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <v-list v-else nav density="compact" class="app-left-drawer-list">
          <v-list-subheader class="text-overline">{{ t('appbar.contact') }}</v-list-subheader>
          <v-list-item
            prepend-icon="mdi-headset"
            :title="t('pages.contact.leftNav.supportTitle')"
            :subtitle="t('pages.contact.leftNav.supportSubtitle')"
          />
          <v-list-item
            prepend-icon="mdi-calendar-clock"
            :title="t('pages.contact.leftNav.meetingTitle')"
            :subtitle="t('pages.contact.leftNav.meetingSubtitle')"
          />
          <v-list-item
            prepend-icon="mdi-email-outline"
            :title="t('pages.contact.leftNav.emailTitle')"
            :subtitle="t('pages.contact.leftNav.emailSubtitle')"
          />
        </v-list>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible" />
        <v-list v-else nav density="compact" class="app-right-drawer-list">
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="secondary">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-headset" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1">{{ t('pages.contact.rightNav.supportTitle') }}</v-card-title>
                <v-card-subtitle>{{ t('pages.contact.rightNav.supportSubtitle') }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                {{ t('pages.contact.rightNav.supportDescription') }}
              </v-card-text>
            </v-card>
          </v-list-item>
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="primary">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-calendar-clock" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1">{{ t('pages.contact.rightNav.meetingTitle') }}</v-card-title>
                <v-card-subtitle>{{ t('pages.contact.rightNav.meetingSubtitle') }}</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                {{ t('pages.contact.rightNav.meetingDescription') }}
              </v-card-text>
            </v-card>
          </v-list-item>
        </v-list>
      </template>
    </AppPageDrawers>

    <v-container class="py-12 text-center">
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <h1 class="text-h3 mb-4">{{ t('appbar.contact') }}</h1>
        <p>{{ t('pages.contact.description') }}</p>
      </template>
    </v-container>
  </div>
</template>
