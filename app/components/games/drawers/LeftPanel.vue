<script setup lang="ts">
const { t } = useI18n()
const { topScores } = useGameDrawerData()
</script>

<template>
  <div class="games-left-panel px-2">
    <v-list nav density="compact" class="bg-transparent">
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
