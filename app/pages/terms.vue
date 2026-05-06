<script setup lang="ts">
definePageMeta({
  title: 'Terms of Service',
  description:
    'Review the Bro World Terms of Service for using accounts, content, platform tools, services, and connected products.',
  keywords:
    'Bro World terms, terms of service, user agreement, platform rules, legal terms',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'yearly', priority: 0.4 },
})
</script>

<template>
  <v-container class="py-8" style="max-width: 900px">
    <h1 class="text-h3 mb-4">Terms of Service</h1>
    <p class="mb-3 text-medium-emphasis">Last updated: April 21, 2026</p>

    <v-card rounded="xl" class="pa-6 postcard-gradient-card">
      <p class="mb-4">
        By accessing or using Bro World, you agree to these Terms of Service.
      </p>

      <h2 class="text-h6 mb-2">1. Use of service</h2>
      <p class="mb-4">
        You agree to use the service lawfully and not to disrupt, abuse, or
        misuse platform features.
      </p>

      <h2 class="text-h6 mb-2">2. Accounts</h2>
      <p class="mb-4">
        You are responsible for your account credentials and all activity under
        your account.
      </p>

      <h2 class="text-h6 mb-2">3. Content and conduct</h2>
      <p class="mb-4">
        You must own or have rights to content you publish and ensure it does
        not violate applicable laws or third-party rights.
      </p>

      <h2 class="text-h6 mb-2">4. Termination</h2>
      <p class="mb-4">
        We may suspend or terminate access in case of abuse, security risks, or
        legal requirements.
      </p>

      <h2 class="text-h6 mb-2">5. Contact</h2>
      <p class="mb-0">
        For legal questions, contact us via
        <NuxtLink to="/contact">the contact page</NuxtLink>.
      </p>
    </v-card>
  </v-container>
</template>
