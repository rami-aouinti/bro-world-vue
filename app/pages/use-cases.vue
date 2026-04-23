<script setup lang="ts">
definePageMeta({
  title: 'Who Is This Platform For?',
  description:
    'Explore use cases for creators, startups, coaches, and online communities that need a private social network.',
})

const useCases = [
  {
    title: 'Creators',
    description:
      'Turn your audience into an owned community with recurring conversations, premium updates, and direct engagement.',
  },
  {
    title: 'Startups',
    description:
      'Create a customer community hub for onboarding, feedback loops, and product advocacy.',
  },
  {
    title: 'Coaches',
    description:
      'Host cohorts, share resources, and manage accountability spaces from one community management platform.',
  },
  {
    title: 'Online communities',
    description:
      'Migrate from fragmented tools to a unified private community platform designed for long-term growth.',
  },
]
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <h1 class="text-h3 text-md-h2 mb-4">Who Is This Platform For?</h1>
        <p class="text-medium-emphasis mb-8">
          Bro World Space adapts to different business models and community
          formats.
        </p>

        <v-row density="comfortable">
          <v-col v-for="item in useCases" :key="item.title" cols="12" md="6">
            <v-card rounded="xl" variant="outlined" height="100%">
              <v-card-title>{{ item.title }}</v-card-title>
              <v-card-text>{{ item.description }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
