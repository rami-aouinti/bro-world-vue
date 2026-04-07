<script setup lang="ts">
definePageMeta({
  title: 'appbar.home',
})
</script>

<template>
  <v-container fluid>
    <v-row class="py-4" dense>
      <v-col cols="12" md="3" lg="3" class="d-none d-md-block">
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="text-subtitle-1">Navigation</v-card-title>
          <v-list density="compact" nav>
            <v-list-item title="Accueil" prepend-icon="mdi-home" />
            <v-list-item title="Découvrir" prepend-icon="mdi-compass" />
            <v-list-item title="Messages" prepend-icon="mdi-message-outline" />
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" sm="12" md="6" lg="6">
        <BlogStoriesCarousel />
        <BlogNewPostCard />
        <BlogPostFeed />
      </v-col>

      <v-col cols="12" sm="12" md="3" lg="3">
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="text-subtitle-1">Tendances</v-card-title>
          <v-list density="compact">
            <v-list-item title="#nuxt" />
            <v-list-item title="#vuetify" />
            <v-list-item title="#frontend" />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
