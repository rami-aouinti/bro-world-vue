<script setup lang="ts">
definePageMeta({
  title: 'Privacy Policy',
  description:
    'Read the Bro World privacy policy to understand how personal data is collected, used, secured, and managed across the platform.',
  keywords:
    'Bro World privacy policy, personal data, data protection, user privacy, privacy rights',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'yearly', priority: 0.4 },
})
</script>

<template>
  <v-container class="py-8" style="max-width: 900px">
    <h1 class="text-h3 mb-4">Privacy Policy</h1>
    <p class="mb-3 text-medium-emphasis">Last updated: April 21, 2026</p>

    <v-card rounded="xl" class="pa-6 postcard-gradient-card">
      <p class="mb-4">
        This Privacy Policy explains how Bro World collects, uses, stores, and
        protects your personal data when you use our website and connected
        services.
      </p>

      <h2 class="text-h6 mb-2">1. Data we collect</h2>
      <ul class="mb-4 ps-6">
        <li>Account details (name, email, username).</li>
        <li>
          Usage and interaction data (pages visited, actions, preferences).
        </li>
        <li>
          Technical information (device/browser/IP logs for security and
          diagnostics).
        </li>
      </ul>

      <h2 class="text-h6 mb-2">2. How we use data</h2>
      <ul class="mb-4 ps-6">
        <li>To provide, secure, and improve the platform.</li>
        <li>To personalize your experience and content.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2 class="text-h6 mb-2">3. Your rights</h2>
      <p class="mb-4">
        You can request access, correction, export, or deletion of your personal
        data. See our dedicated data deletion page for details.
      </p>

      <h2 class="text-h6 mb-2">4. Contact</h2>
      <p class="mb-0">
        For privacy requests, contact us via
        <NuxtLink to="/contact">the contact page</NuxtLink>.
      </p>
    </v-card>
  </v-container>
</template>
