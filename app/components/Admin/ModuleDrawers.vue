<script setup lang="ts">
import { ADMIN_SECTIONS, PAGE_MANAGEMENT_NAV_ITEMS } from '~/constants/adminManagement'

const route = useRoute()
</script>

<template>
  <AppPageDrawers>
    <template #left>
      <v-list nav density="compact" rounded="xl" class="bg-transparent">
        <v-list-item
          title="Admin Dashboard"
          prepend-icon="mdi-monitor-dashboard"
          to="/admin"
          :active="route.path === '/admin'"
          rounded="lg"
          color="primary"
        />
        <template v-for="item in ADMIN_SECTIONS" :key="item.key">
          <v-list-group
            v-if="item.key === 'pages'"
            value="pages-management"
            :model-value="route.path === item.route"
          >
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :title="item.navTitle"
                :prepend-icon="item.icon"
                :to="`${item.route}?pageType=home`"
                :active="route.path === item.route"
                color="primary"
                rounded="lg"
              />
            </template>

            <v-list-item
              v-for="subItem in PAGE_MANAGEMENT_NAV_ITEMS"
              :key="subItem.key"
              :title="subItem.title"
              prepend-icon="mdi-subdirectory-arrow-right"
              :to="`${item.route}?pageType=${subItem.key}`"
              :active="route.path === item.route && route.query.pageType === subItem.key"
              color="primary"
              rounded="lg"
            />
          </v-list-group>
          <v-list-item
            v-else
            :title="item.navTitle"
            :prepend-icon="item.icon"
            :to="item.route"
            :active="route.path === item.route"
            rounded="lg"
            color="primary"
          />
        </template>
      </v-list>
    </template>
  </AppPageDrawers>
</template>
