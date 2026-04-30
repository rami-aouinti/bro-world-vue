<script setup lang="ts">
import type { BasketballStandingRow } from '~/composables/useBasketballData'
import SportsBasketballTeamAvatar from '~/components/Sports/Basketball/TeamAvatar.vue'

defineProps<{
  standings: BasketballStandingRow[]
}>()

const emit = defineEmits<{
  'select-player': [playerId: number]
}>()

const resolveRowPlayer = (row: BasketballStandingRow) => {
  const candidates = [
    row.topPlayerId,
    row.topPlayer?.id,
    (row as Record<string, any>).top_player_id,
    (row as Record<string, any>).leader?.id,
    (row as Record<string, any>).team?.leader?.id,
    (row as Record<string, any>).team?.topPlayer?.id,
  ]

  const playerId =
    candidates.find(
      (candidate) => typeof candidate === 'number' && candidate > 0,
    ) ?? null
  const name =
    (typeof row.topPlayer?.name === 'string' && row.topPlayer.name.trim()) ||
    (typeof (row as Record<string, any>).leader?.name === 'string' &&
      (row as Record<string, any>).leader.name.trim()) ||
    'Player details'

  return { playerId, name }
}

const selectPlayer = (row: BasketballStandingRow) => {
  const resolved = resolveRowPlayer(row)
  if (resolved.playerId) {
    emit('select-player', resolved.playerId)
  }
}
</script>

<template>
  <v-card variant="outlined" class="football-surface football-interactive-card">
    <v-card-title>Standings</v-card-title>
    <v-divider />
    <v-table density="compact" class="text-no-wrap">
      <thead>
        <tr>
          <th>#</th>
          <th class="text-left">Team</th>
          <th>W</th>
          <th>L</th>
          <th>PF</th>
          <th>PA</th>
          <th>GP</th>
          <th class="text-right">Player</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in standings" :key="row.team.id">
          <td>{{ row.position }}</td>
          <td class="text-left">
            <div class="d-flex align-center ga-2">
              <sports-basketball-team-avatar
                :team-name="row.team.name"
                :logo="row.team.logo"
                :size="24"
              />
              <span>{{ row.team.name }}</span>
            </div>
          </td>
          <td>{{ row.win.total }}</td>
          <td>{{ row.lose.total }}</td>
          <td>{{ row.points.for }}</td>
          <td>{{ row.points.against }}</td>
          <td>{{ row.played }}</td>
          <td class="text-right">
            <v-btn
              size="x-small"
              variant="text"
              color="primary"
              prepend-icon="mdi-account-search"
              :disabled="!resolveRowPlayer(row).playerId"
              @click.stop="selectPlayer(row)"
            >
              {{ resolveRowPlayer(row).name }}
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
