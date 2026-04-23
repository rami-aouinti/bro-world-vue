<script setup lang="ts">
definePageMeta({
  title: 'Community Growth Blog',
  description:
    'Read practical guides to build an online community platform and create your own social network in 2026.',
})

const blogIdeas = [
  {
    title: 'How to Build an Online Community in 2026',
    excerpt:
      'A practical roadmap to launch, structure, and grow a community from zero.',
  },
  {
    title: 'Best Alternatives to Facebook Groups',
    excerpt:
      'Compare modern private community platform options for creators and teams.',
  },
  {
    title: 'How to Create a Private Social Network',
    excerpt:
      'Learn the key building blocks, workflows, and member engagement systems.',
  },
]
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <h1 class="text-h3 text-md-h2 mb-4">Community Growth Blog</h1>
        <p class="text-medium-emphasis mb-8">
          Weekly insights on community tools for creators, member engagement,
          and platform strategy.
        </p>

        <v-row density="comfortable" class="mb-8">
          <v-col v-for="article in blogIdeas" :key="article.title" cols="12">
            <v-card rounded="xl" variant="outlined">
              <v-card-title>{{ article.title }}</v-card-title>
              <v-card-text>{{ article.excerpt }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-alert type="info" variant="tonal">
          Need tailored advice? Reach out on our <NuxtLink to="/contact">contact page</NuxtLink>.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>
