<script setup lang="ts">
import type { QuizLeaderboardApiResponse } from '~~/server/types/api/quiz'

type LeaderboardEntry = {
  rank: number
  username: string
  profilePath: string | null
  avatarUrl: string | null
  weightedAverageScore: number | null
  attempts: number | null
}

const {
  data: leaderboardResponse,
  status,
  refresh,
} = await useAsyncData<QuizLeaderboardApiResponse>(
  'quiz-public-leaderboard',
  () => $fetch<QuizLeaderboardApiResponse>('/api/quiz/public/leaderboard'),
  {
    default: () => ({ items: [] }),
  },
)
const { t } = useI18n()

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length ? value : null
}

function userProfilePath(username: string | null): string | null {
  return username
    ? `/user/${encodeURIComponent(username)}/profile`
    : null
}

const leaderboardEntries = computed<LeaderboardEntry[]>(() => {
  const items = Array.isArray(leaderboardResponse.value?.items)
    ? leaderboardResponse.value.items
    : []

  return items.map((rawItem, index) => {
    const item = asRecord(rawItem)
    const profile = asRecord(item.profile)

    const weightedAverageScore =
      asNumber(item.weightedAverageScore) ??
      asNumber(item.averageWeightedScore) ??
      asNumber(item.avgWeightedScore) ??
      asNumber(item.score)

    const attempts =
      asNumber(item.attempts) ??
      asNumber(item.attemptCount) ??
      asNumber(item.totalAttempts)

    const username = asString(item.username) ?? asString(profile.username)

    return {
      rank: asNumber(item.rank) ?? index + 1,
      username:
        username ??
        t('quiz.leaderboard.fallbackUser', {
          index: index + 1,
        }),
      profilePath: userProfilePath(username),
      avatarUrl:
        asString(item.avatar) ??
        asString(item.photo) ??
        asString(item.avatarUrl) ??
        asString(profile.avatar) ??
        asString(profile.photo) ??
        asString(profile.avatarUrl),
      weightedAverageScore,
      attempts,
    }
  })
})

const isPending = computed(() => status.value === 'pending')
const isError = computed(() => status.value === 'error')
const isEmpty = computed(
  () =>
    !isPending.value && !isError.value && leaderboardEntries.value.length === 0,
)

function formatScore(value: number | null) {
  if (value === null) return '—'
  return `${Math.round(value)}%`
}
</script>

<template>
  <div class="quiz-leaderboard-panel">
    <v-chip color="primary" variant="outlined" class="mb-4" label>
      {{ t('quiz.leaderboard.title') }}
    </v-chip>

    <v-card v-if="isPending" variant="tonal" color="primary" rounded="lg">
      <v-card-text>
        <v-skeleton-loader type="list-item-avatar-two-line@4" />
      </v-card-text>
    </v-card>

    <v-card v-else-if="isError" variant="outlined" color="error" rounded="lg">
      <v-card-text class="d-flex flex-column ga-3">
        <div class="text-body-2">
          {{ t('quiz.leaderboard.error') }}
        </div>
        <v-btn
          color="error"
          variant="tonal"
          prepend-icon="mdi-refresh"
          @click="refresh()"
        >
          {{ t('quiz.leaderboard.retry') }}
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card v-else-if="isEmpty" variant="outlined" rounded="lg">
      <v-card-text class="text-body-2 text-medium-emphasis">
        {{ t('quiz.leaderboard.empty') }}
      </v-card-text>
    </v-card>

    <v-list v-else class="quiz-leaderboard-panel__list" density="compact" nav>
      <v-list-item
        v-for="entry in leaderboardEntries"
        :key="`${entry.rank}-${entry.username}`"
        class="quiz-leaderboard-panel__item"
      >
        <template #prepend>
          <div class="d-flex align-center ga-2">
            <v-chip size="x-small" color="primary" variant="tonal" label>
              #{{ entry.rank }}
            </v-chip>
            <v-avatar size="36" variant="tonal" color="primary">
              <v-img v-if="entry.avatarUrl" :src="entry.avatarUrl" cover />
              <span v-else class="text-caption">{{
                entry.username.slice(0, 1).toUpperCase()
              }}</span>
            </v-avatar>
          </div>
        </template>

        <v-list-item-title class="font-weight-medium">
          <NuxtLink
            v-if="entry.profilePath"
            :to="entry.profilePath"
            class="quiz-leaderboard-panel__user-link text-decoration-none"
          >
            {{ entry.username }}
          </NuxtLink>
          <span v-else>{{ entry.username }}</span>
        </v-list-item-title>

        <v-list-item-subtitle class="quiz-leaderboard-panel__subtitle mt-1">
          <span> {{ formatScore(entry.weightedAverageScore) }}</span>
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped>
.quiz-leaderboard-panel {
  height: 100%;
}

.quiz-leaderboard-panel__list {
  background-color: transparent;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quiz-leaderboard-panel__subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  white-space: normal;
}

.quiz-leaderboard-panel__user-link {
  color: inherit;
}
</style>
