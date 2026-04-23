<script setup lang="ts">
definePageMeta({
  title: 'Build Your Own Online Community Platform',
  description:
    'Create and manage your own online community with an easy-to-use platform. Build a private social network, engage members, and grow your audience.',
})

const primaryFeatures = [
  {
    title: 'Build an online community platform quickly',
    description:
      'Launch a digital community platform in minutes with a clear onboarding flow and ready-to-use community tools for creators.',
  },
  {
    title: 'Create your own social network',
    description:
      'Design a private community platform where members can share updates, engage in discussions, and build meaningful relationships.',
  },
  {
    title: 'Community management platform for growth',
    description:
      'Manage members online with moderation, analytics, and simple CRM for communities in one place.',
  },
]
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-chip color="primary" variant="tonal" class="mb-4">
          A simple platform to build and manage your own online community
        </v-chip>
        <h1 class="text-h3 text-md-h2 mb-4">
          Create Your Own Online Community Platform
        </h1>
        <p class="text-h6 text-medium-emphasis mb-4">
          Bro World Space is a simple and powerful platform that allows you to
          build and manage your own online community.
        </p>
        <p class="mb-3">
          Whether you're a creator, entrepreneur, or organization, you can
          create a private social network, connect with your audience, and
          manage your members بسهولة.
        </p>
        <p class="mb-6">No technical skills required. Launch your community in minutes.</p>

        <div class="d-flex flex-wrap ga-3 mb-10">
          <v-btn color="primary" to="/pricing" size="large">View Pricing</v-btn>
          <v-btn variant="outlined" to="/features" size="large">Explore Features</v-btn>
        </div>

        <v-row density="comfortable" class="mb-8">
          <v-col v-for="feature in primaryFeatures" :key="feature.title" cols="12" md="4">
            <v-card rounded="xl" variant="outlined" height="100%">
              <v-card-title class="text-wrap">{{ feature.title }}</v-card-title>
              <v-card-text>{{ feature.description }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card rounded="xl" class="pa-6" variant="tonal" color="primary">
          <h2 class="text-h5 mb-3">Looking for an alternative to social media platforms?</h2>
          <p class="mb-4">
            Keep your audience in a focused, branded environment with structured
            discussions, member spaces, and direct communication channels.
          </p>
          <div class="d-flex flex-wrap ga-2">
            <v-btn variant="flat" color="white" to="/use-cases">See Use Cases</v-btn>
            <v-btn variant="outlined" color="white" to="/blog">Read SEO Guides</v-btn>
            <v-btn variant="text" color="white" to="/contact">Contact Sales</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
