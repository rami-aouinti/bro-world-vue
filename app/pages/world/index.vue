<script setup lang="ts">
definePageMeta({ title: 'World' })

const worldSections = [
  {
    title: 'CRM',
    to: '/world/crm',
    icon: 'mdi-account-group-outline',
    description: 'Projects, company data and admin operations.',
  },
  {
    title: 'Shop',
    to: '/world/shop',
    icon: 'mdi-storefront-outline',
    description: 'Categories, products, checkout and order management.',
  },
  {
    title: 'Learning',
    to: '/world/learning',
    icon: 'mdi-school-outline',
    description: 'Courses by level and structured learning paths.',
  },
  {
    title: 'Jobs',
    to: '/world/jobs',
    icon: 'mdi-briefcase-search-outline',
    description: 'Offers, applications and recruitment workflows.',
  },
]
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-3">
      <v-card-title class="text-h5">World menu</v-card-title>
      <v-card-subtitle>Choose one business domain to continue.</v-card-subtitle>
      <v-row class="mt-2">
        <v-col
          v-for="section in worldSections"
          :key="section.to"
          cols="12"
          sm="6"
        >
          <v-card :to="section.to" class="h-100" rounded="lg" variant="tonal">
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
