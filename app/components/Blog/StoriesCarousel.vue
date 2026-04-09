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
  userId?: string | number | null
  user?: StoryOwner | null
  owner?: boolean
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
  stories?: Array<StoryGroup | StoryMedia>
  data?: unknown
  items?: Array<StoryGroup | StoryMedia>
  results?: Array<StoryGroup | StoryMedia>
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
const isHydrated = ref(false)
const { user, loggedIn } = useUserSession()
const { locale, t } = useI18n()

const {
  data,
  pending: storiesPending,
  refresh,
} = await useFetch<StoriesApiResponse | StoryGroup[]>('/api/stories', {
  default: () => [],
  server: false,
})

onMounted(() => {
  isHydrated.value = true
})

watch(loggedIn, async (isLoggedIn, wasLoggedIn) => {
  if (!isLoggedIn) {
    localStoryGroups.value = []
    return
  }

  if (!wasLoggedIn) {
    await refresh()
  }
})

const sessionUserId = computed(() => String(user.value?.id ?? ''))

function getStoryOwner(story: StoryMedia): StoryOwner | null {
  if (!story.user) return null

  return {
    id: story.user.id,
    name: story.user.name,
    firstName: story.user.firstName,
    lastName: story.user.lastName,
    avatarUrl: story.user.avatarUrl,
    photo: story.user.photo,
  }
}

function findStorySource(
  value: unknown,
  depth = 0,
): Array<StoryGroup | StoryMedia> {
  if (Array.isArray(value)) {
    return value as Array<StoryGroup | StoryMedia>
  }

  if (!value || typeof value !== 'object' || depth > 4) {
    return []
  }

  const record = value as Record<string, unknown>
  const preferredKeys = ['stories', 'story', 'items', 'results', 'data']

  for (const key of preferredKeys) {
    const nestedSource = findStorySource(record[key], depth + 1)
    if (nestedSource.length > 0) {
      return nestedSource
    }
  }

  return []
}

function normalizeStoryGroups(
  payload: StoriesApiResponse | StoryGroup[] | null | undefined,
): StoryGroup[] {
  const source = findStorySource(payload)

  if (source.length === 0) {
    return []
  }

  const groupedStories = new Map<string, StoryGroup>()

  source.forEach((entry, index) => {
    const record = entry as StoryGroup & {
      story?: StoryMedia[]
      medias?: StoryMedia[]
    }
    const storyList = Array.isArray(record.stories)
      ? record.stories
      : Array.isArray(record.story)
        ? record.story
        : Array.isArray(record.medias)
          ? record.medias
          : null

    if (storyList) {
      const key = String(record.id ?? record.user?.id ?? `group-${index}`)
      groupedStories.set(key, {
        id: record.id ?? record.user?.id ?? key,
        owner: Boolean(record.owner),
        user: record.user ?? null,
        stories: storyList,
      })
      return
    }

    const story = entry as StoryMedia
    const owner = Boolean(story.owner)
    const storyOwner = getStoryOwner(story)
    const ownerId = storyOwner?.id ?? story.userId ?? null
    const key = String(ownerId ?? `story-${index}`)
    const existingGroup = groupedStories.get(key)

    if (existingGroup) {
      existingGroup.stories.push(story)
      return
    }

    groupedStories.set(key, {
      id: ownerId ?? key,
      owner,
      user: storyOwner,
      stories: [story],
    })
  })

  return Array.from(groupedStories.values())
}

const storyGroups = computed<StoryGroup[]>(() =>
  normalizeStoryGroups(data.value),
)

watch(
  storyGroups,
  (groups) => {
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
              const createdAtA = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0
              const createdAtB = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0

              return createdAtB - createdAtA
            })
        : [],
    }))
  },
  { immediate: true },
)

const cards = computed(() => {
  return localStoryGroups.value
    .map((group, index) => {
      const stories = Array.isArray(group.stories) ? group.stories : []
      const latestStory = stories[0]
      const cover =
        latestStory?.coverUrl ||
        latestStory?.thumbnailUrl ||
        latestStory?.imageUrl ||
        latestStory?.mediaUrl ||
        null

      return {
        ...group,
        index,
        stories,
        latestStory,
        cover,
        displayName: group.owner
          ? t('blog.story.yourStory')
          : group.user?.name ||
            `${group.user?.firstName || ''} ${group.user?.lastName || ''}`.trim() ||
            t('blog.common.userFallback'),
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

  return (
    selectedGroup.value.owner ||
    (ownerId != null && String(ownerId) === sessionUserId.value)
  )
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

  return candidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.length > 0,
  )
})

const storyReactions = ['👍', '❤️', '🥰', '😆', '😮', '😢', '😡']

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
    uploadError.value = t('blog.story.uploadErrorImageOnly')
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
  } catch {
    uploadError.value = t('blog.story.uploadError')
  } finally {
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
  if (
    deletePending.value ||
    !selectedGroup.value ||
    !selectedStory.value?.id ||
    !canDeleteSelectedStory.value
  ) {
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
  const groupIndex = localStoryGroups.value.findIndex(
    (group) => String(group.id) === String(groupId),
  )

  if (groupIndex >= 0) {
    const targetGroup = localStoryGroups.value[groupIndex]
    if (!targetGroup) {
      return
    }

    targetGroup.stories = targetGroup.stories.filter(
      (story) => String(story.id) !== storyId,
    )

    const storiesCount = targetGroup.stories.length

    if (storiesCount === 0) {
      viewerOpen.value = false
      selectedGroupIndex.value = null
      selectedStoryIndex.value = 0
    } else if (selectedStoryIndex.value >= storiesCount) {
      selectedStoryIndex.value = storiesCount - 1
    }
  }

  try {
    await $fetch(`/api/stories/${storyId}`, {
      method: 'DELETE',
    })
  } catch {
    deleteError.value = t('blog.story.deleteError')
    localStoryGroups.value = previousGroups
    await refresh()
  } finally {
    deletePending.value = false
  }
}
</script>

<template>
  <v-card rounded="xl" class="mb-4 stories-shell">
    <v-card-title
      class="text-subtitle-1 font-weight-bold d-flex align-center justify-space-between"
    >
      <span>{{ t('blog.story.title') }}</span>
      <v-btn
        icon="mdi-plus"
        :aria-label="t('blog.story.createCta')"
        size="small"
        variant="text"
        :loading="uploadPending"
        :disabled="uploadPending"
        @click.stop="triggerUpload"
      />
    </v-card-title>
    <v-card-text class="pt-2">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="d-none"
        @change="handleFileSelect"
      />

      <div class="d-flex ga-3 overflow-x-auto pb-2">
        <v-sheet
          v-for="card in cards"
          :key="card.id ?? card.index"
          rounded="xl"
          class="story-card d-flex flex-column justify-space-between"
          min-width="130"
          height="220"
          :style="
            card.cover
              ? `background-image: linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.15)), url(${card.cover});`
              : ''
          "
          @click="openViewer(card.index)"
        >
          <div class="d-flex justify-space-between align-start pa-2">
            <v-avatar size="38" class="story-avatar">
              <v-img
                :src="card.avatar"
                :alt="`${card.displayName} avatar`"
                cover
              />
            </v-avatar>

            <v-btn
              v-if="card.owner"
              icon="mdi-plus"
              :aria-label="t('blog.story.createCta')"
              size="small"
              color="primary"
              variant="flat"
              :loading="uploadPending"
              :disabled="uploadPending"
              @click.stop="triggerUpload"
            />
          </div>

          <div
            class="pa-2 text-white text-caption font-weight-medium story-label"
          >
            <div>{{ card.displayName }}</div>
            <div v-if="card.owner" class="text-caption text-grey-lighten-2">
              {{
                uploadPending
                  ? t('blog.story.uploading')
                  : t('blog.story.createCta')
              }}
            </div>
          </div>
        </v-sheet>

        <v-sheet
          v-if="isHydrated && !storiesPending && cards.length === 0"
          rounded="lg"
          class="d-flex align-center px-4 text-medium-emphasis"
          min-width="160"
          height="220"
        >
          {{ t('blog.story.empty') }}
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
        {{
          t('blog.story.publishSuccess', {
            id: latestCreatedStory.id,
            createdAt: latestCreatedStory.createdAt,
            expiresAt: latestCreatedStory.expiresAt,
          })
        }}
      </v-alert>
    </v-card-text>
  </v-card>

  <v-dialog v-model="viewerOpen" fullscreen scrim="rgba(0,0,0,.93)">
    <v-card v-if="selectedGroup && selectedStory" class="story-viewer">
      <div class="story-stage">
        <v-btn
          class="story-nav-btn story-nav-btn--left"
          icon="mdi-chevron-left"
          aria-label="Previous story"
          variant="flat"
          color="grey-darken-3"
          :disabled="!hasPreviousStory"
          @click="goToPreviousStory"
        />

        <v-sheet rounded="xl" class="story-phone-frame overflow-hidden">
          <v-img
            :src="selectedStoryVisual"
            :alt="selectedGroup.displayName"
            class="story-media"
            cover
          >
            <div class="story-overlay-top pa-4">
              <div class="d-flex ga-1 mb-3">
                <div
                  v-for="(item, itemIndex) in selectedGroup.stories"
                  :key="
                    String(
                      item.id ?? `${selectedGroup.id}-progress-${itemIndex}`,
                    )
                  "
                  class="story-progress-track"
                >
                  <div
                    class="story-progress-value"
                    :class="{
                      'story-progress-value--active':
                        selectedStoryIndex >= itemIndex,
                    }"
                  />
                </div>
              </div>
              <div class="d-flex align-center justify-space-between text-white">
                <div class="d-flex align-center ga-2">
                  <v-avatar size="40" class="story-avatar">
                    <v-img
                      :src="selectedGroup.avatar"
                      :alt="`${selectedGroup.displayName} avatar`"
                      cover
                    />
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">
                      {{ selectedGroup.displayName }}
                    </div>
                    <div v-if="selectedStoryRelativeTime" class="text-caption">
                      {{ selectedStoryRelativeTime }}
                    </div>
                  </div>
                </div>
                <div class="d-flex align-center ga-1">
                  <v-btn
                    icon="mdi-volume-high"
                    aria-label="Story volume"
                    size="small"
                    variant="text"
                    color="white"
                  />
                  <v-btn
                    icon="mdi-play"
                    aria-label="Play story"
                    size="small"
                    variant="text"
                    color="white"
                  />
                  <v-btn
                    icon="mdi-dots-horizontal"
                    aria-label="Story options"
                    size="small"
                    variant="text"
                    color="white"
                  />
                </div>
              </div>
            </div>

            <div class="story-overlay-bottom pa-4">
              <div class="d-flex align-center ga-2">
                <v-text-field
                  :placeholder="t('blog.story.messagePlaceholder')"
                  density="compact"
                  hide-details
                  variant="outlined"
                  rounded="pill"
                  bg-color="rgba(0,0,0,.45)"
                  color="white"
                  class="story-reply-input"
                />
                <div class="d-flex align-center story-reactions">
                  <button
                    v-for="emoji in storyReactions"
                    :key="emoji"
                    type="button"
                    class="story-reaction-btn"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
          </v-img>
        </v-sheet>

        <v-btn
          class="story-nav-btn story-nav-btn--right"
          icon="mdi-chevron-right"
          aria-label="Next story"
          variant="flat"
          color="grey-darken-3"
          :disabled="!hasNextStory"
          @click="goToNextStory"
        />
      </div>

      <div class="d-flex justify-center mt-4">
        <v-btn
          v-if="canDeleteSelectedStory"
          color="error"
          variant="tonal"
          :loading="deletePending"
          :disabled="deletePending"
          @click="deleteSelectedStory"
        >
          {{ t('blog.story.deleteCta') }}
        </v-btn>
        <v-btn class="ml-2" variant="text" @click="viewerOpen = false">
          {{ t('common.close') }}
        </v-btn>
      </div>

      <v-alert
        v-if="deleteError"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mx-auto mt-3"
        max-width="540"
      >
        {{ deleteError }}
      </v-alert>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.stories-shell {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
}

.story-card {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.story-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
}

.story-avatar {
  border: 2px solid rgb(var(--v-theme-primary));
}

.story-label {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.75);
}

.story-viewer {
  background: #000;
  color: #fff;
}

.story-stage {
  min-height: calc(100dvh - 110px);
  display: grid;
  grid-template-columns: 84px minmax(280px, 460px) 84px;
  justify-content: center;
  align-items: center;
  gap: 18px;
  padding-top: 14px;
}

.story-phone-frame {
  width: min(460px, calc(100vw - 180px));
  height: min(84dvh, 820px);
  background: #1f1f1f;
}

.story-media {
  width: 100%;
  height: 100%;
}

.story-overlay-top {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.62),
    rgba(0, 0, 0, 0.08)
  );
}

.story-overlay-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.12));
}

.story-progress-track {
  flex: 1;
  height: 4px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.28);
  overflow: hidden;
}

.story-progress-value {
  width: 0;
  height: 100%;
  background: #fff;
  transition: width 0.2s ease;
}

.story-progress-value--active {
  width: 100%;
}

.story-reply-input :deep(input) {
  color: #fff;
}

.story-reactions {
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.45);
}

.story-reaction-btn {
  border: 0;
  background: transparent;
  font-size: 1.55rem;
  cursor: pointer;
}

.story-nav-btn {
  width: 66px;
  height: 66px;
  border-radius: 999px;
}

@media (max-width: 900px) {
  .story-stage {
    grid-template-columns: 1fr;
    gap: 12px;
    padding-inline: 12px;
  }

  .story-phone-frame {
    width: min(460px, 100%);
    justify-self: center;
    height: min(78dvh, 760px);
  }

  .story-nav-btn {
    display: none;
  }
}
</style>
