<script setup lang="ts">
definePageMeta({
  title: 'Pricing for Your Community Management Platform',
  description:
    'Choose the right plan to create your own social network and manage your members online with Bro World Space.',
})

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    subtitle: 'For early creators validating their first community',
    features: ['Up to 100 members', 'Core posting and engagement', 'Basic support'],
  },
  {
    name: 'Growth',
    price: '$49/mo',
    subtitle: 'For active teams scaling a private community platform',
    features: ['Up to 2,500 members', 'Advanced moderation', 'Community analytics'],
  },
  {
    name: 'Scale',
    price: 'Custom',
    subtitle: 'For organizations running a digital community platform at scale',
    features: ['Unlimited members', 'Dedicated onboarding', 'Priority success'],
  },
]
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <h1 class="text-h3 text-md-h2 mb-4">Simple Pricing for Growing Communities</h1>
        <p class="text-medium-emphasis mb-8">
          Start free, scale when your community grows, and choose the plan that
          matches your goals.
        </p>
        <v-row density="comfortable">
          <v-col v-for="plan in pricingPlans" :key="plan.name" cols="12" md="4">
            <v-card rounded="xl" variant="outlined" height="100%">
              <v-card-item>
                <v-card-title>{{ plan.name }}</v-card-title>
                <v-card-subtitle>{{ plan.subtitle }}</v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <div class="text-h4 mb-4">{{ plan.price }}</div>
                <ul class="ps-5 mb-0">
                  <li v-for="feature in plan.features" :key="feature" class="mb-2">{{ feature }}</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
