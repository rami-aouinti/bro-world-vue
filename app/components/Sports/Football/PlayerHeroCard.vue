<script setup lang="ts">
defineProps<{
  profile: {
    name: string
    nationality: string | null
    age: number | null
    photo: string | null
    height: string | null
    weight: string | null
  }
}>()
</script>

<template>
  <v-sheet rounded="lg" border class="pa-4 mb-4 bg-surface-variant">
    <div class="d-flex align-center ga-4">
      <v-avatar size="88" rounded="lg">
        <v-img :src="profile.photo || undefined" cover />
      </v-avatar>

      <div>
        <div class="text-h6 font-weight-bold">{{ profile.name }}</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ profile.nationality || 'Unknown nationality' }} · {{ profile.age ? `${profile.age} years` : 'Age -' }}
        </div>
        <div class="text-caption text-medium-emphasis mt-1">
          {{ profile.height || '-' }} · {{ profile.weight || '-' }}
        </div>
      </div>
    </div>
  </v-sheet>
</template>
