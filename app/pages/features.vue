<script setup lang="ts">
definePageMeta({
  title: 'Powerful Features to Build and Manage Your Community',
  description:
    'Discover member management, content sharing, engagement tools, and analytics to run your online community platform.',
})

const featureSections = [
  {
    title: 'Member management',
    points: [
      'Invite and organize members with structured roles and permissions.',
      'Track activity to manage members online with confidence.',
      'Use a simple CRM for communities to centralize profile context.',
    ],
  },
  {
    title: 'Content sharing',
    points: [
      'Publish updates, discussions, and long-form posts from one dashboard.',
      'Share media and resources across your private community platform.',
      'Keep a searchable content timeline for your community knowledge base.',
    ],
  },
  {
    title: 'Community engagement tools',
    points: [
      'Enable reactions, comments, and collaborative conversations.',
      'Create a healthy communication space as an alternative to social media platforms.',
      'Drive retention with recurring engagement rituals and announcements.',
    ],
  },
  {
    title: 'Analytics',
    points: [
      'Monitor growth, participation, and recurring active members.',
      'Understand what content generates the most engagement.',
      'Make faster decisions with simple performance snapshots.',
    ],
  },
]
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <h1 class="text-h3 text-md-h2 mb-4">
          Powerful Features to Build and Manage Your Community
        </h1>
        <p class="text-medium-emphasis mb-8">
          Everything you need to build an online community platform without
          technical complexity.
        </p>

        <v-row density="comfortable">
          <v-col v-for="section in featureSections" :key="section.title" cols="12" md="6">
            <v-card rounded="xl" variant="outlined" height="100%">
              <v-card-title>{{ section.title }}</v-card-title>
              <v-card-text>
                <ul class="ps-5 mb-0">
                  <li v-for="point in section.points" :key="point" class="mb-2">{{ point }}</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
