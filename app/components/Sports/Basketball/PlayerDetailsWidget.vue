<script setup lang="ts">
import type { BasketballPlayerDetails, BasketballSectionState } from '~/composables/useBasketballData'
import SportsBasketballTeamAvatar from '~/components/Sports/Basketball/TeamAvatar.vue'

const props = withDefaults(defineProps<{
  playerDetails: BasketballPlayerDetails | null
  playerState: BasketballSectionState
  playerError: string
  loadingOverride?: boolean
}>(), {
  loadingOverride: false,
})

const hasPlayer = computed(() => Boolean(props.playerDetails?.player))

const profile = computed(() => props.playerDetails?.player ?? null)
const team = computed(() => props.playerDetails?.team ?? null)

const primaryStat = computed(() => props.playerDetails?.statistics?.[0] ?? null)

const statValue = (value: unknown) => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  return '-'
}

const metricCards = computed(() => {
  const stat = primaryStat.value as Record<string, any> | null

  return [
    {
      label: 'Points',
      value: statValue(stat?.points?.total ?? stat?.points?.points),
    },
    {
      label: 'Rebounds',
      value: statValue(stat?.rebounds?.total),
    },
    {
      label: 'Assists',
      value: statValue(stat?.assists?.total),
    },
    {
      label: 'Minutes',
      value: statValue(stat?.games?.minutes),
    },
  ]
})
</script>

<template>
  <v-card class="h-100 football-surface football-surface--glow football-interactive-card" variant="outlined">
    <v-card-title>Player details</v-card-title>
    <v-divider />
    <v-card-text>
      <template v-if="loadingOverride || playerState === 'loading'">
        <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
        <span>Loading basketball player details…</span>
      </template>

      <v-alert
        v-else-if="playerState === 'error'"
        type="error"
        variant="tonal"
        density="compact"
      >
        {{ playerError || 'Unable to load player details.' }}
      </v-alert>

      <v-alert
        v-else-if="playerState === 'empty' || !hasPlayer"
        type="info"
        variant="tonal"
        density="compact"
      >
        Select a player to show the profile.
      </v-alert>

      <template v-else>
        <div class="d-flex flex-wrap align-center ga-4 mb-5">
          <v-avatar size="84" class="player-avatar">
            <v-img
              v-if="profile?.photo"
              :src="profile.photo"
              :alt="profile?.name || 'Player photo'"
              cover
            />
            <span v-else class="text-h6 font-weight-bold">
              {{ (profile?.name || '?').slice(0, 2).toUpperCase() }}
            </span>
          </v-avatar>

          <div class="min-w-0 flex-1">
            <div class="text-h6 font-weight-bold text-truncate">{{ profile?.name || 'Unknown player' }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ profile?.nationality || 'Nationality unavailable' }} ·
              {{ profile?.age ? `${profile.age} years` : 'Age unavailable' }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ profile?.height || 'Height n/a' }} · {{ profile?.weight || 'Weight n/a' }}
            </div>
            <v-chip
              v-if="profile?.injured === true"
              class="mt-2"
              color="error"
              size="small"
              variant="tonal"
            >
              Injured
            </v-chip>
          </div>
        </div>

        <v-card variant="outlined" class="mb-5">
          <v-card-text class="d-flex align-center ga-3">
            <sports-basketball-team-avatar
              :team-name="team?.name || 'Unknown team'"
              :logo="team?.logo || null"
              :size="36"
            />
            <div>
              <div class="text-subtitle-2">Team</div>
              <div class="text-body-2">{{ team?.name || 'Unknown team' }}</div>
            </div>
          </v-card-text>
        </v-card>

        <v-row>
          <v-col
            v-for="metric in metricCards"
            :key="metric.label"
            cols="6"
            md="3"
          >
            <v-card variant="outlined">
              <v-card-text>
                <div class="text-caption text-medium-emphasis">{{ metric.label }}</div>
                <div class="text-h6 font-weight-bold">{{ metric.value }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.player-avatar {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
  background: rgba(var(--v-theme-surface-variant), 0.4);
}
</style>
