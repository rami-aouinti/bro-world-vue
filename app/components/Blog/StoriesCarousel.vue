<script setup lang="ts">
type StoryMedia = {
  id?: string | number
  mediaUrl?: string | null
  coverUrl?: string | null
  thumbnailUrl?: string | null
  title?: string | null
}

type StoryOwner = {
  id?: string | number
  name?: string | null
  avatarUrl?: string | null
}

type StoryGroup = {
  id?: string | number
  owner: boolean
  user?: StoryOwner | null
  stories: StoryMedia[]
}

type StoriesApiResponse = {
  stories?: StoryGroup[]
  data?: StoryGroup[]
}

const fallbackAvatar = 'https://api.dicebear.com/9.x/initials/svg?seed=Story'
const viewerOpen = ref(false)
const selectedGroupIndex = ref<number | null>(null)
const selectedStoryIndex = ref(0)

const { data, pending } = await useFetch<StoriesApiResponse | StoryGroup[]>('/api/stories', {
  default: () => [],
})

const storyGroups = computed<StoryGroup[]>(() => {
  if (Array.isArray(data.value)) {
    return data.value
  }

  return data.value?.stories ?? data.value?.data ?? []
})

const cards = computed(() => {
  return storyGroups.value
    .map((group, index) => {
      const stories = Array.isArray(group.stories) ? group.stories : []
      const latestStory = stories.at(-1)
      const cover = latestStory?.coverUrl || latestStory?.thumbnailUrl || latestStory?.mediaUrl || null

      return {
        ...group,
        index,
        stories,
        latestStory,
        cover,
        displayName: group.owner ? 'Your story' : group.user?.name || 'Utilisateur',
        avatar: group.user?.avatarUrl || fallbackAvatar,
      }
    })
    .filter((group) => group.owner || group.stories.length > 0)
})

const selectedGroup = computed(() => {
  if (selectedGroupIndex.value === null) {
    return null
  }

  return cards.value[selectedGroupIndex.value] ?? null
})

const selectedStory = computed(() => {
  if (!selectedGroup.value) {
    return null
  }

  return selectedGroup.value.stories[selectedStoryIndex.value] ?? null
})

const hasPreviousStory = computed(() => selectedStoryIndex.value > 0)
const hasNextStory = computed(() => {
  if (!selectedGroup.value) {
    return false
  }

  return selectedStoryIndex.value < selectedGroup.value.stories.length - 1
})

function openViewer(index: number) {
  const group = cards.value[index]
  if (!group || group.stories.length === 0) {
    return
  }

  selectedGroupIndex.value = index
  selectedStoryIndex.value = group.stories.length - 1
  viewerOpen.value = true
}

function goToPreviousStory() {
  if (hasPreviousStory.value) {
    selectedStoryIndex.value -= 1
  }
}

function goToNextStory() {
  if (hasNextStory.value) {
    selectedStoryIndex.value += 1
  }
}
</script>

<template>
  <v-card rounded="lg" class="mb-4">
    <v-card-title class="text-subtitle-1 font-weight-bold">Stories</v-card-title>
    <v-card-text>
      <div class="d-flex ga-3 overflow-x-auto pb-2">
        <v-sheet
          v-for="card in cards"
          :key="card.id ?? card.index"
          rounded="lg"
          class="story-card d-flex flex-column justify-space-between"
          min-width="120"
          height="180"
          :style="card.cover ? `background-image: linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.15)), url(${card.cover});` : ''"
          @click="openViewer(card.index)"
        >
          <div class="d-flex justify-space-between align-start pa-2">
            <v-avatar size="32" class="story-avatar">
              <v-img :src="card.avatar" cover />
            </v-avatar>

            <v-btn
              v-if="card.owner"
              icon="mdi-plus"
              size="x-small"
              color="white"
              variant="flat"
            />
          </div>

          <div class="pa-2 text-white text-caption font-weight-medium">
            <div>{{ card.displayName }}</div>
            <div v-if="card.owner">Ajouter</div>
          </div>
        </v-sheet>

        <v-sheet
          v-if="!pending && cards.length === 0"
          rounded="lg"
          class="d-flex align-center px-4 text-medium-emphasis"
          min-width="140"
          height="180"
        >
          Aucune story
        </v-sheet>
      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="viewerOpen" max-width="460">
    <v-card v-if="selectedGroup && selectedStory">
      <v-img
        :src="selectedStory.mediaUrl || selectedStory.coverUrl || selectedStory.thumbnailUrl"
        height="440"
        cover
      >
        <div class="d-flex justify-space-between align-center pa-3 text-white">
          <div class="text-subtitle-2">{{ selectedGroup.displayName }}</div>
          <div class="text-caption">{{ selectedStoryIndex + 1 }}/{{ selectedGroup.stories.length }}</div>
        </div>
      </v-img>
      <v-card-actions class="justify-space-between">
        <v-btn :disabled="!hasPreviousStory" variant="text" @click="goToPreviousStory">Précédente</v-btn>
        <v-btn :disabled="!hasNextStory" variant="text" @click="goToNextStory">Suivante</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.story-card {
  background: linear-gradient(to top, rgba(37, 37, 37, 0.65), rgba(37, 37, 37, 0.35));
  background-size: cover;
  background-position: center;
  cursor: pointer;
}

.story-avatar {
  border: 2px solid rgb(var(--v-theme-primary));
}
</style>
