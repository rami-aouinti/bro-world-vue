<script setup lang="ts">
definePageMeta({
  title: 'Posts',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <ProfileDrawer />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <h1 class="text-h4 mb-4">Posts</h1>
      <BlogPostFeed mode="mine" :show-composer="true" :show-stories="false" />
    </v-container>
  </div>
</template>
