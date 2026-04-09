<script setup lang="ts">
const { t } = useI18n()

const topScores = [
  { name: 'NovaBlade', score: 12840, avatar: '/img/team-1.jpg' },
  { name: 'PixelQueen', score: 11720, avatar: '/img/team-2.jpg' },
  { name: 'ArcadeWolf', score: 10995, avatar: '/img/team-3.jpg' },
]
</script>

<template>
  <div class="games-left-panel px-2">
    <AppLeftDrawerUserEntry class="px-2 pt-2" />

    <v-divider class="my-4" />

    <v-list nav density="comfortable" class="px-1">
      <v-chip variant="outlined" color="primary" class="mb-2">
        {{ t('gamePage.drawer.topScores') }}
      </v-chip>

      <v-list-item
        v-for="(user, index) in topScores"
        :key="user.name"
        :title="user.name"
        :subtitle="`${user.score} pts`"
      >
        <template #prepend>
          <v-avatar size="34">
            <v-img :src="user.avatar" :alt="user.name" cover />
          </v-avatar>
        </template>
        <template #append>
          <v-chip size="x-small" color="warning" variant="tonal">
            #{{ index + 1 }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped>
.games-left-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
