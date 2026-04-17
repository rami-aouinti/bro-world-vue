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
const { t } = useI18n()

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
      label: t('pages.applications.basketball.metrics.points'),
      value: statValue(stat?.points?.total ?? stat?.points?.points),
    },
    {
      label: t('pages.applications.basketball.metrics.rebounds'),
      value: statValue(stat?.rebounds?.total),
    },
    {
      label: t('pages.applications.basketball.metrics.assists'),
      value: statValue(stat?.assists?.total),
    },
    {
      label: t('pages.applications.basketball.metrics.minutes'),
      value: statValue(stat?.games?.minutes),
    },
  ]
})
</script>

<template>
  <v-card class="h-100 football-surface football-surface--glow football-interactive-card" variant="outlined">
    <v-card-title>{{ t('pages.applications.basketball.playerDetails') }}</v-card-title>
    <v-divider />
    <v-card-text>
      <template v-if="loadingOverride || playerState === 'loading'">
        <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
        <span>{{ t('pages.applications.basketball.loadingPlayerDetails') }}</span>
      </template>

      <v-alert
        v-else-if="playerState === 'error'"
        type="error"
        variant="tonal"
        density="compact"
      >
        {{ playerError || t('pages.applications.basketball.unableToLoadPlayerDetails') }}
      </v-alert>

      <v-alert
        v-else-if="playerState === 'empty' || !hasPlayer"
        type="info"
        variant="tonal"
        density="compact"
      >
        {{ t('pages.applications.basketball.selectPlayerProfile') }}
      </v-alert>

      <template v-else>
        <div class="d-flex flex-wrap align-center ga-4 mb-5">
          <v-avatar size="84" class="player-avatar">
            <v-img
              v-if="profile?.photo"
              :src="profile.photo"
              :alt="profile?.name || t('pages.applications.basketball.playerPhoto')"
              cover
            />
            <span v-else class="text-h6 font-weight-bold">
              {{ (profile?.name || '?').slice(0, 2).toUpperCase() }}
            </span>
          </v-avatar>

          <div class="min-w-0 flex-1">
            <div class="text-h6 font-weight-bold text-truncate">{{ profile?.name || t('pages.applications.football.misc.unknownPlayer') }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ profile?.nationality || t('pages.applications.football.misc.unknownNationality') }} ·
              {{ profile?.age ? t('pages.applications.football.misc.ageYears', { age: profile.age }) : t('pages.applications.football.misc.ageUnknown') }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ profile?.height || t('pages.applications.basketball.heightNotAvailable') }} · {{ profile?.weight || t('pages.applications.basketball.weightNotAvailable') }}
            </div>
            <v-chip
              v-if="profile?.injured === true"
              class="mt-2"
              color="error"
              size="small"
              variant="tonal"
            >
              {{ t('pages.applications.basketball.injured') }}
            </v-chip>
          </div>
        </div>

        <v-card variant="outlined" class="mb-5">
          <v-card-text class="d-flex align-center ga-3">
            <sports-basketball-team-avatar
              :team-name="team?.name || t('pages.applications.football.misc.unknownTeam')"
              :logo="team?.logo || null"
              :size="36"
            />
            <div>
              <div class="text-subtitle-2">{{ t('pages.applications.football.stats.team') }}</div>
              <div class="text-body-2">{{ team?.name || t('pages.applications.football.misc.unknownTeam') }}</div>
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
