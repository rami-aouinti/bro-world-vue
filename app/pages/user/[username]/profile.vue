<script setup lang="ts">
definePageMeta({
  title: 'User profile',
})

const route = useRoute()
const username = computed(() => String(route.params.username ?? ''))

type PublicUserProfile = {
  id: string
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  photo: string | null
  coins: number
}

const {
  data: profile,
  pending,
  error,
} = await useAsyncData<PublicUserProfile>(
  () => `public-profile-${username.value}`,
  () => $fetch(`/api/public/user/${encodeURIComponent(username.value)}`),
  {
    watch: [username],
  },
)

const displayName = computed(() => {
  if (!profile.value) return username.value

  const fullName = [profile.value.firstName, profile.value.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || profile.value.username || username.value
})
</script>

<template>
  <v-container fluid class="py-6">
    <div class="mx-auto" style="max-width: 760px">
      <v-progress-linear
        v-if="pending"
        indeterminate
        color="primary"
        class="mb-4"
      />

      <v-alert v-else-if="error" type="error" variant="tonal">
        Impossible de charger le profil public de <strong>{{ username }}</strong
        >.
      </v-alert>

      <v-card v-else-if="profile" rounded="xl">
        <v-card-item>
          <template #prepend>
            <v-avatar size="76" color="grey-darken-2" class="me-4">
              <v-img
                v-if="profile.photo"
                :src="profile.photo"
                :alt="`${displayName} avatar`"
              />
              <v-icon v-else icon="mdi-account" />
            </v-avatar>
          </template>

          <v-card-title class="text-h5">{{ displayName }}</v-card-title>
          <v-card-subtitle>@{{ profile.username }}</v-card-subtitle>
        </v-card-item>

        <v-divider />

        <v-card-text class="d-flex flex-column ga-2">
          <div><strong>Email:</strong> {{ profile.email }}</div>
          <div><strong>Coins:</strong> {{ profile.coins }}</div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>
