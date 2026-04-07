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
  count: number
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

const summary = computed(() => {
  const map = new Map<string, number>()

  for (const reaction of props.reactions) {
    const code = reaction.type?.toLowerCase() ?? ''
    map.set(code, (map.get(code) ?? 0) + reaction.count)
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

    <span class="text-subtitle-2">{{ totalReactions.toLocaleString() }}</span>
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
</style>
