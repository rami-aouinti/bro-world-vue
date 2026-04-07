<script setup lang="ts">
const { loggedIn } = useUserSession()

definePageMeta({
  title: 'appbar.home',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <v-card-title class="text-subtitle-1">Navigation</v-card-title>
        <v-list density="compact" nav>
          <v-list-item title="Accueil" prepend-icon="mdi-home" />
          <v-list-item title="Découvrir" prepend-icon="mdi-compass" />
          <v-list-item title="Messages" prepend-icon="mdi-message-outline" />
        </v-list>
      </template>
      <template #right>
        <v-card-title class="text-subtitle-1">Tendances</v-card-title>
        <v-list density="compact">
          <v-list-item title="#nuxt" />
          <v-list-item title="#vuetify" />
          <v-list-item title="#frontend" />
        </v-list>
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <template v-if="loggedIn">
        <BlogStoriesCarousel />
        <BlogNewPostCard />
      </template>
      <BlogPostFeed />
    </v-container>
  </div>
</template>
