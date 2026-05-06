<script setup lang="ts">
definePageMeta({
  title: 'World',
  description:
    'Open Bro World business domains for CRM, jobs, learning, shop, projects, courses, recruitment, and online operations.',
  keywords:
    'Bro World, CRM, jobs, learning, shop, business domains, online operations, project management',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'weekly', priority: 0.7 },
})

const { t } = useI18n()

const worldSections = computed(() => [
  {
    title: t('world.crm.label', 'CRM'),
    to: '/world/crm',
    icon: 'mdi-account-group-outline',
    description: t(
      'world.crm.description',
      'Projects, company data and admin operations.',
    ),
  },
  {
    title: t('world.shop.label', 'Shop'),
    to: '/world/shop',
    icon: 'mdi-storefront-outline',
    description: t(
      'world.shop.description',
      'Categories, products, checkout and order management.',
    ),
  },
  {
    title: t('world.learning.label', 'Learning'),
    to: '/world/learning',
    icon: 'mdi-school-outline',
    description: t(
      'world.learning.description',
      'Courses by level and structured learning paths.',
    ),
  },
  {
    title: t('world.jobs.label', 'Jobs'),
    to: '/world/jobs',
    icon: 'mdi-briefcase-search-outline',
    description: t(
      'world.jobs.description',
      'Offers, applications and recruitment workflows.',
    ),
  },
])
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-3 postcard-gradient-card">
      <v-card-title class="text-h5">{{
        t('world.home.title', 'World menu')
      }}</v-card-title>
      <v-card-subtitle>{{
        t('world.home.subtitle', 'Choose one business domain to continue.')
      }}</v-card-subtitle>
      <v-row class="mt-2">
        <v-col
          v-for="section in worldSections"
          :key="section.to"
          cols="12"
          sm="6"
        >
          <v-card
            :to="section.to"
            class="h-100 postcard-gradient-card"
            rounded="lg"
            variant="text"
          >
            <v-card-item>
              <template #prepend>
                <v-icon :icon="section.icon" size="28" class="mr-3" />
              </template>
              <v-card-title>{{ section.title }}</v-card-title>
              <v-card-subtitle>{{ section.description }}</v-card-subtitle>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
