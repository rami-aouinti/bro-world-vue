<script setup lang="ts">
definePageMeta({
  title: 'appbar.applications',
})

const { t } = useI18n()

const applicationItems = [
  {
    title: 'appbar.platform',
    to: '/platform',
    icon: 'mdi-view-dashboard-outline',
  },
  { title: 'appbar.games', to: '/games', icon: 'mdi-gamepad-variant-outline' },
  {
    title: 'appbar.sports',
    to: '/applications/sports',
    icon: 'mdi-basketball',
  },
  { title: 'appbar.quiz', to: '/applications/quiz', icon: 'mdi-help-box' },
]
</script>

<template>
  <v-container fluid>
    <v-card>
      <v-card-title>{{ t('appbar.applications') }}</v-card-title>
      <v-list>
        <v-list-item
          v-for="item in applicationItems"
          :key="item.to"
          :title="t(item.title)"
          :prepend-icon="item.icon"
          :to="item.to"
        />
      </v-list>
    </v-card>
  </v-container>
</template>
