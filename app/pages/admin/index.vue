<script setup lang="ts">
definePageMeta({
  icon: 'mdi-monitor-dashboard',
  title: 'appbar.admin',
  drawerIndex: 1,
})

const showRightDrawerDesktop = useState('show-right-drawer-desktop', () => true)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)

showRightDrawerDesktop.value = false
showRightDrawerMobile.value = false

const { data: statistics, pending } = await useAsyncData('admin-statistics', () =>
  $fetch('/api/admin/statistics'),
)

const userStats = computed(
  () =>
    statistics.value?.users ?? {
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
    },
)

const appStats = computed(
  () =>
    statistics.value?.applications ?? {
      total: 0,
      byPlatform: [],
    },
)

const pluginStats = computed(
  () =>
    statistics.value?.plugins ?? {
      total: 0,
      usage: [],
    },
)

const postStats = computed(
  () =>
    statistics.value?.posts ?? {
      total: 0,
      last7Days: 0,
      thisMonth: 0,
      thisYear: 0,
    },
)
</script>

<template>
  <div>
    <AdminModuleDrawers />

    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Users"
            color="primary"
            icon="mdi-account-group-outline"
            :value="userStats.total"
          >
            <template #footer> This week: {{ userStats.thisWeek }} </template>
          </StatsCard>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Applications"
            color="warning"
            icon="mdi-apps"
            :value="appStats.total"
          >
            <template #footer>
              Platforms: {{ appStats.byPlatform.length }}
            </template>
          </StatsCard>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Plugins"
            color="success"
            icon="mdi-puzzle-outline"
            :value="pluginStats.total"
          >
            <template #footer>
              Active usage: {{ pluginStats.usage.length }}
            </template>
          </StatsCard>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Posts"
            color="info"
            icon="mdi-post-outline"
            :value="postStats.total"
          >
            <template #footer> Last 7 days: {{ postStats.last7Days }} </template>
          </StatsCard>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-card class="pa-4 postcard-gradient-card rounded-xl">
            <h3 class="text-h6 mb-3">Applications by platform</h3>
            <v-data-table
              :loading="pending"
              :headers="[
                { title: 'Platform', key: 'name' },
                { title: 'Applications', key: 'applicationCount' },
              ]"
              :items="appStats.byPlatform"
              :items-per-page="5"
              density="comfortable"
              class="bg-transparent"
            />
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 postcard-gradient-card rounded-xl">
            <h3 class="text-h6 mb-3">Plugin usage</h3>
            <v-data-table
              :loading="pending"
              :headers="[
                { title: 'Plugin', key: 'name' },
                { title: 'Usage', key: 'usageCount' },
              ]"
              :items="pluginStats.usage"
              :items-per-page="5"
              density="comfortable"
              class="bg-transparent"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
