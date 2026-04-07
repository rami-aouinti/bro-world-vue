<script setup lang="ts">
const { loggedIn } = useUserSession()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'appbar.home',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <template v-if="isPageSkeletonVisible">
          <SkeletonDrawerLeft />
        </template>
        <template v-else>
          <v-card-title class="text-subtitle-1">{{ $t('home.leftNav.title') }}</v-card-title>
          <v-list density="compact" nav>
            <v-list-item :title="$t('home.leftNav.home')" prepend-icon="mdi-home" />
            <v-list-item :title="$t('home.leftNav.discover')" prepend-icon="mdi-compass" />
            <v-list-item :title="$t('home.leftNav.messages')" prepend-icon="mdi-message-outline" />
          </v-list>
        </template>
      </template>
      <template #right>
        <template v-if="isPageSkeletonVisible">
          <SkeletonDrawerRight />
        </template>
        <template v-else>
          <v-card-title class="text-subtitle-1">{{ $t('home.rightNav.trending') }}</v-card-title>
          <v-list density="compact">
            <v-list-item :title="$t('home.rightNav.tags.nuxt')" />
            <v-list-item :title="$t('home.rightNav.tags.vuetify')" />
            <v-list-item :title="$t('home.rightNav.tags.frontend')" />
          </v-list>
        </template>
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <template v-if="loggedIn">
          <BlogNewPostCard />
          <BlogStoriesCarousel />
        </template>
        <BlogPostFeed />
      </template>
    </v-container>
  </div>
</template>
