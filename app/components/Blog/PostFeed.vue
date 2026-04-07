<template>
  <v-card rounded="lg">
    <v-list lines="two">
      <v-list-subheader>Fil du blog</v-list-subheader>
      <v-list-item
        v-for="post in posts"
        :key="post.title"
        :title="post.title"
        :subtitle="post.author"
      >
        <template #append>
          <span class="text-caption text-medium-emphasis">{{ post.time }}</span>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
const posts = [
  { title: 'Bienvenue sur le feed', author: 'Bro World', time: 'Maintenant' },
  { title: 'Nouveautés produit', author: 'Équipe produit', time: 'Il y a 2 h' },
  { title: 'Idées de la communauté', author: 'Community Team', time: 'Hier' },
]
</script>
