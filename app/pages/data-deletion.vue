<script setup lang="ts">
definePageMeta({
  title: 'Data Deletion',
  description:
    'Learn how to request deletion of your Bro World account data and understand the privacy request process.',
  keywords:
    'Bro World data deletion, delete account data, privacy request, personal data removal, user rights',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'yearly', priority: 0.4 },
})
</script>

<template>
  <v-container class="py-8" style="max-width: 900px">
    <h1 class="text-h3 mb-4">Data Deletion Instructions</h1>
    <p class="mb-3 text-medium-emphasis">Last updated: April 21, 2026</p>

    <v-card rounded="xl" class="pa-6 postcard-gradient-card">
      <p class="mb-4">
        If you want your personal data deleted from Bro World, follow the
        process below.
      </p>

      <h2 class="text-h6 mb-2">How to request deletion</h2>
      <ol class="mb-4 ps-6">
        <li>Go to <NuxtLink to="/contact">/contact</NuxtLink>.</li>
        <li>Select a privacy/data topic in your request.</li>
        <li>
          Provide your account email/identifier and the deletion request
          details.
        </li>
      </ol>

      <h2 class="text-h6 mb-2">What happens next</h2>
      <ul class="mb-4 ps-6">
        <li>We verify ownership of the account for security.</li>
        <li>We process deletion of account-related personal data.</li>
        <li>
          We may retain minimal records required by law, fraud prevention, or
          security.
        </li>
      </ul>

      <h2 class="text-h6 mb-2">Processing timeline</h2>
      <p class="mb-0">
        Standard requests are handled within 30 days, subject to legal and
        technical constraints.
      </p>
    </v-card>
  </v-container>
</template>
