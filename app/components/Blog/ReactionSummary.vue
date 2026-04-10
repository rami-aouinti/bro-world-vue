<script setup lang="ts">
type ReactionCode =
  | 'like'
  | 'heart'
  | 'laugh'
  | 'celebrate'
  | 'wow'
  | 'sad'
  | 'angry'

type ReactionItem = {
  type: string
  count?: number
  author?: {
    id?: string
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    displayName?: string | null
    photo?: string | null
  } | null
}

const props = withDefaults(
  defineProps<{
    reactions?: ReactionItem[]
  }>(),
  {
    reactions: () => [],
  },
)

const iconMap: Record<ReactionCode, string> = {
  like: '👍',
  heart: '❤️',
  laugh: '😄',
  celebrate: '🥳',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}

const reactionOrder: ReactionCode[] = [
  'like',
  'heart',
  'celebrate',
  'laugh',
  'wow',
  'sad',
  'angry',
]

const detailsOpen = ref(false)

function normalizedReactionCount(reaction: ReactionItem) {
  return typeof reaction.count === 'number' && reaction.count > 0
    ? reaction.count
    : 1
}

const summary = computed(() => {
  const map = new Map<string, number>()

  for (const reaction of props.reactions) {
    const code = reaction.type?.toLowerCase() ?? ''
    map.set(code, (map.get(code) ?? 0) + normalizedReactionCount(reaction))
  }

  return reactionOrder
    .map((type) => ({
      type,
      icon: iconMap[type],
      count: map.get(type) ?? 0,
    }))
    .filter((item) => item.count > 0)
})

const totalReactions = computed(() =>
  summary.value.reduce((acc, item) => acc + item.count, 0),
)

const groupedReactors = computed(() => {
  const groups = new Map<
    string,
    Array<{
      id: string
      name: string
      username: string | null
      photo: string | null
    }>
  >()

  for (const reaction of props.reactions) {
    const code = reaction.type?.toLowerCase() ?? ''
    const author = reaction.author
    if (!code || !author) {
      continue
    }

    const userId =
      (typeof author.id === 'string' && author.id) ||
      (typeof author.username === 'string' && author.username) ||
      ''
    if (!userId) {
      continue
    }

    if (!groups.has(code)) {
      groups.set(code, [])
    }

    const current = groups.get(code)!
    if (current.some((entry) => entry.id === userId)) {
      continue
    }

    const fullName = [author.firstName, author.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()

    current.push({
      id: userId,
      name:
        author.displayName?.trim() ||
        fullName ||
        author.username?.trim() ||
        'User',
      username: author.username ?? null,
      photo: author.photo ?? null,
    })
  }

  return reactionOrder
    .map((type) => ({
      type,
      icon: iconMap[type],
      users: groups.get(type) ?? [],
    }))
    .filter((entry) => entry.users.length > 0)
})

const canShowDetails = computed(() => groupedReactors.value.length > 0)
</script>

<template>
  <div v-if="totalReactions > 0" class="reaction-summary text-medium-emphasis">
    <div class="reaction-chips">
      <span
        v-for="(item, index) in summary.slice(0, 6)"
        :key="item.type"
        class="reaction-chip"
        :style="{ zIndex: `${30 - index}` }"
      >
        {{ item.icon }}
      </span>
    </div>

    <button
      type="button"
      class="reaction-total text-subtitle-2"
      :disabled="!canShowDetails"
      @click="canShowDetails && (detailsOpen = true)"
    >
      {{ totalReactions.toLocaleString() }}
    </button>

    <v-dialog v-model="detailsOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Reactions</v-card-title>
        <v-card-text class="pt-1">
          <div
            v-for="group in groupedReactors"
            :key="group.type"
            class="reaction-group"
          >
            <div class="text-subtitle-2 mb-2">
              {{ group.icon }} · {{ group.users.length }}
            </div>

            <v-list density="compact" bg-color="transparent" class="py-0">
              <v-list-item
                v-for="user in group.users"
                :key="`${group.type}-${user.id}`"
              >
                <template #prepend>
                  <v-avatar size="28" class="me-2">
                    <v-img v-if="user.photo" :src="user.photo" :alt="user.name" />
                    <v-icon v-else icon="mdi-account" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ user.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="user.username">
                  @{{ user.username }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.reaction-summary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.reaction-chips {
  display: flex;
}

.reaction-chip {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 2px solid rgba(27, 29, 33, 0.95);
  display: grid;
  place-items: center;
  font-size: 0.95rem;
  margin-left: -5px;
  background: #111;
}

.reaction-chip:first-child {
  margin-left: 0;
}

.reaction-total {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.reaction-total:disabled {
  cursor: default;
}

.reaction-group:not(:last-child) {
  margin-bottom: 0.75rem;
}
</style>
