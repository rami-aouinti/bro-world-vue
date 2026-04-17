<script setup lang="ts">
import type { BasketballStandingRow } from '~/composables/useBasketballData'
import SportsBasketballTeamAvatar from '~/components/Sports/Basketball/TeamAvatar.vue'

defineProps<{
  standings: BasketballStandingRow[]
}>()
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
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
