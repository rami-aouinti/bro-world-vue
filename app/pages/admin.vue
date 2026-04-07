<script setup lang="ts">
const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  icon: 'mdi-monitor-dashboard',
  title: 'appbar.admin',
  drawerIndex: 1,
})
const stats = ref([
  {
    icon: 'mdi-web',
    title: t('dashboard.stats.bandwidth.title'),
    value: 23,
    unit: t('dashboard.stats.bandwidth.unit'),
    color: 'primary',
    caption: t('dashboard.stats.bandwidth.caption'),
  },
  {
    icon: 'mdi-rss',
    title: t('dashboard.stats.submissions.title'),
    value: 108,
    color: 'primary',
    caption: t('dashboard.stats.submissions.caption'),
  },
  {
    icon: 'mdi-send',
    title: t('dashboard.stats.requests.title'),
    value: 1238,
    color: 'warning',
    caption: t('dashboard.stats.requests.caption'),
  },
  {
    icon: 'mdi-bell',
    title: t('dashboard.stats.messages.title'),
    value: 9042,
    color: 'primary',
    caption: t('dashboard.stats.messages.caption'),
  },
  {
    icon: 'mdi-github',
    title: t('dashboard.stats.githubStars.title'),
    value: NaN,
    color: 'grey',
    caption: t('dashboard.stats.githubStars.caption'),
  },
  {
    icon: 'mdi-currency-cny',
    title: t('dashboard.stats.totalFee.title'),
    value: 2300,
    unit: t('dashboard.stats.totalFee.unit'),
    color: 'error',
    caption: t('dashboard.stats.totalFee.caption'),
  },
])
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
      </template>
      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible" />
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
      <v-row>
        <v-col
          v-for="stat in stats"
          :key="stat.title"
          cols="12"
          sm="6"
          md="6"
          lg="4"
        >
          <StatsCard
            :title="stat.title"
            :unit="stat.unit"
            :color="stat.color"
            :icon="stat.icon"
            :value="stat.value"
          >
            <template #footer>
              {{ stat.caption }}
            </template>
          </StatsCard>
        </v-col>
      </v-row>

      <ShowcaseDesignCards class="mb-6" />

      <v-row>
        <v-col cols="12" md="6" lg="12">
          <v-card class="pa-2">
            <ChartLine />
          </v-card>
        </v-col>
        <v-col cols="12" md="6" lg="4">
          <v-card class="pa-2">
            <ChartRadar />
          </v-card>
        </v-col>
        <v-col cols="12" md="6" lg="4">
          <v-card class="pa-2">
            <ChartPie />
          </v-card>
        </v-col>
        <v-col cols="12" md="6" lg="4">
          <v-card class="pa-2">
            <ChartBar />
          </v-card>
        </v-col>
      </v-row>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.v-card:not(.stats-card) {
  height: 340px;
}
</style>
