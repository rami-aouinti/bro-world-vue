<script setup lang="ts">
type StoryMedia = {
  id?: string | number
  mediaUrl?: string | null
  coverUrl?: string | null
  thumbnailUrl?: string | null
  imageUrl?: string | null
  createdAt?: string | null
  expiresAt?: string | null
  title?: string | null
}

type StoryOwner = {
  id?: string | number
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  photo?: string | null
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
  items?: StoryGroup[]
}

type StoryCreateResponse = {
  id: string | number
  imageUrl: string
  createdAt: string
  expiresAt: string
}

const fallbackAvatar = 'https://api.dicebear.com/9.x/initials/svg?seed=Story'
const viewerOpen = ref(false)
const selectedGroupIndex = ref<number | null>(null)
const selectedStoryIndex = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadPending = ref(false)
const uploadError = ref<string | null>(null)
const latestCreatedStory = ref<StoryCreateResponse | null>(null)
const deletePending = ref(false)
const deleteError = ref<string | null>(null)
const localStoryGroups = ref<StoryGroup[]>([])
const { user } = useUserSession()
const { locale } = useI18n()

const { data, pending: storiesPending, refresh } = await useFetch<StoriesApiResponse | StoryGroup[]>('/api/stories', {
  default: () => [],
})

const sessionUserId = computed(() => String(user.value?.id ?? ''))

const storyGroups = computed<StoryGroup[]>(() => {
  if (Array.isArray(data.value)) {
    return data.value
  }

  return data.value?.stories ?? data.value?.data ?? data.value?.items ?? []
})

watch(storyGroups, (groups) => {
  const now = Date.now()

  localStoryGroups.value = groups.map((group) => ({
    ...group,
    user: group.user ? { ...group.user } : null,
    stories: Array.isArray(group.stories)
      ? group.stories
        .map((story) => ({ ...story }))
        .filter((story) => {
          if (!story.expiresAt) {
            return true
          }

          const expiresAt = new Date(story.expiresAt).getTime()
          if (Number.isNaN(expiresAt)) {
            return true
          }

          return expiresAt > now
        })
        .sort((a, b) => {
          const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0

          return createdAtB - createdAtA
        })
      : [],
  }))
}, { immediate: true })

const cards = computed(() => {
  return localStoryGroups.value
    .map((group, index) => {
      const stories = Array.isArray(group.stories) ? group.stories : []
      const latestStory = stories[0]
      const cover = latestStory?.coverUrl || latestStory?.thumbnailUrl || latestStory?.imageUrl || latestStory?.mediaUrl || null

      return {
        ...group,
        index,
        stories,
        latestStory,
        cover,
        displayName: group.owner
          ? 'Your story'
          : group.user?.name
            || `${group.user?.firstName || ''} ${group.user?.lastName || ''}`.trim()
            || 'Utilisateur',
        avatar: group.user?.avatarUrl || group.user?.photo || fallbackAvatar,
      }
    })
    .filter((group) => group.owner || group.stories.length > 0)
})

const selectedGroup = computed(() => {
  if (selectedGroupIndex.value === null) {
    return undefined
  }

  return cards.value[selectedGroupIndex.value] ?? null
})

const selectedStory = computed(() => {
  if (!selectedGroup.value) {
    return undefined
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

const canDeleteSelectedStory = computed(() => {
  if (!selectedGroup.value) {
    return false
  }

  const ownerId = selectedGroup.value.user?.id

  return selectedGroup.value.owner || (ownerId != null && String(ownerId) === sessionUserId.value)
})

const selectedStoryVisual = computed<string | undefined>(() => {
  if (!selectedStory.value) {
    return undefined
  }

  const candidates = [
    selectedStory.value.imageUrl,
    selectedStory.value.mediaUrl,
    selectedStory.value.coverUrl,
    selectedStory.value.thumbnailUrl,
  ]

  return candidates.find((candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0)
})

function openViewer(index: number) {
  const group = cards.value[index]
  if (!group || group.stories.length === 0) {
    return
  }

  selectedGroupIndex.value = index
  selectedStoryIndex.value = 0
  viewerOpen.value = true
}

const selectedStoryRelativeTime = computed(() => {
  if (!selectedStory.value?.createdAt) {
    return ''
  }

  const createdAt = new Date(selectedStory.value.createdAt).getTime()
  if (Number.isNaN(createdAt)) {
    return ''
  }

  const diffMs = createdAt - Date.now()
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })

  if (Math.abs(diffMs) >= dayMs) {
    return rtf.format(Math.round(diffMs / dayMs), 'day')
  }

  if (Math.abs(diffMs) >= hourMs) {
    return rtf.format(Math.round(diffMs / hourMs), 'hour')
  }

  return rtf.format(Math.round(diffMs / minuteMs), 'minute')
})

function triggerUpload() {
  if (uploadPending.value) {
    return
  }

  uploadError.value = null
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Seules les images sont autorisées.'
    return
  }

  uploadPending.value = true
  uploadError.value = null

  try {
    const formData = new FormData()
    formData.append('image', file)

    const createdStory = await $fetch<StoryCreateResponse>('/api/stories', {
      method: 'POST',
      body: formData,
    })

    latestCreatedStory.value = createdStory
    await refresh()
  }
  catch {
    uploadError.value = "Impossible d'envoyer la story pour le moment."
  }
  finally {
    uploadPending.value = false
  }
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

async function deleteSelectedStory() {
  if (deletePending.value || !selectedGroup.value || !selectedStory.value?.id || !canDeleteSelectedStory.value) {
    return
  }

  deletePending.value = true
  deleteError.value = null

  const storyId = String(selectedStory.value.id)
  const previousGroups = localStoryGroups.value.map((group) => ({
    ...group,
    user: group.user ? { ...group.user } : null,
    stories: group.stories.map((story) => ({ ...story })),
  }))

  const groupId = selectedGroup.value.id
  const groupIndex = localStoryGroups.value.findIndex((group) => String(group.id) === String(groupId))

  if (groupIndex >= 0) {
    localStoryGroups.value[groupIndex].stories = localStoryGroups.value[groupIndex].stories
      .filter((story) => String(story.id) !== storyId)

    const storiesCount = localStoryGroups.value[groupIndex].stories.length

    if (storiesCount === 0) {
      viewerOpen.value = false
      selectedGroupIndex.value = null
      selectedStoryIndex.value = 0
    }
    else if (selectedStoryIndex.value >= storiesCount) {
      selectedStoryIndex.value = storiesCount - 1
    }
  }

  try {
    await $fetch(`/api/stories/${storyId}`, {
      method: 'DELETE',
    })
  }
  catch {
    deleteError.value = 'Suppression impossible pour le moment. Synchronisation en cours.'
    localStoryGroups.value = previousGroups
    await refresh()
  }
  finally {
    deletePending.value = false
  }
}
</script>

<template>
  <v-card rounded="lg" class="mb-4">
    <v-card-title class="text-subtitle-1 font-weight-bold">Stories</v-card-title>
    <v-card-text>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="d-none"
        @change="handleFileSelect"
      >

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
              :icon="uploadPending ? 'mdi-loading' : 'mdi-plus'"
              size="x-small"
              color="white"
              variant="flat"
              :loading="uploadPending"
              :disabled="uploadPending"
              @click.stop="triggerUpload"
            />
          </div>

          <div class="pa-2 text-white text-caption font-weight-medium">
            <div>{{ card.displayName }}</div>
            <div v-if="card.owner">{{ uploadPending ? 'Envoi…' : 'Ajouter' }}</div>
          </div>
        </v-sheet>

        <v-sheet
          v-if="!storiesPending && cards.length === 0"
          rounded="lg"
          class="d-flex align-center px-4 text-medium-emphasis"
          min-width="140"
          height="180"
        >
          Aucune story
        </v-sheet>
      </div>

      <v-alert
        v-if="uploadError"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mt-3"
      >
        {{ uploadError }}
      </v-alert>

      <v-alert
        v-if="deleteError"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mt-3"
      >
        {{ deleteError }}
      </v-alert>

      <v-alert
        v-if="latestCreatedStory"
        type="success"
        variant="tonal"
        density="comfortable"
        class="mt-3"
      >
        Story publiée (#{{ latestCreatedStory.id }}) · créée {{ latestCreatedStory.createdAt }} · expire {{ latestCreatedStory.expiresAt }}
      </v-alert>
    </v-card-text>
  </v-card>

  <v-dialog v-model="viewerOpen" max-width="460">
    <v-card v-if="selectedGroup && selectedStory">
      <v-img
        :src="selectedStoryVisual"
        height="440"
        cover
      >
        <div class="d-flex justify-space-between align-center pa-3 text-white">
          <div>
            <div class="text-subtitle-2">{{ selectedGroup.displayName }}</div>
            <div v-if="selectedStoryRelativeTime" class="text-caption">{{ selectedStoryRelativeTime }}</div>
          </div>
          <div class="text-caption">{{ selectedStoryIndex + 1 }}/{{ selectedGroup.stories.length }}</div>
        </div>
      </v-img>
      <v-card-actions class="justify-space-between">
        <v-btn :disabled="!hasPreviousStory" variant="text" @click="goToPreviousStory">Précédente</v-btn>
        <div class="d-flex align-center ga-2">
          <v-btn
            v-if="canDeleteSelectedStory"
            color="error"
            variant="text"
            :loading="deletePending"
            :disabled="deletePending"
            @click="deleteSelectedStory"
          >
            Supprimer
          </v-btn>
          <v-btn :disabled="!hasNextStory" variant="text" @click="goToNextStory">Suivante</v-btn>
        </div>
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
