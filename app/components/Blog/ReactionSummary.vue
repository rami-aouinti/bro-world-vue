<script setup lang="ts">
type ReactionCode = 'like' | 'heart' | 'laugh' | 'celebrate'

type ReactionItem = {
  type: string
  count: number
}

const props = withDefaults(defineProps<{
  reactions?: ReactionItem[]
}>(), {
  reactions: () => [],
})

const iconMap: Record<ReactionCode, string> = {
  like: 'mdi-thumb-up-outline',
  heart: 'mdi-heart-outline',
  laugh: 'mdi-emoticon-happy-outline',
  celebrate: 'mdi-party-popper',
}

const reactionOrder: ReactionCode[] = ['like', 'heart', 'laugh', 'celebrate']

const summary = computed(() => {
  const map = new Map<string, number>()

  for (const reaction of props.reactions) {
    const code = reaction.type?.toLowerCase() ?? ''
    map.set(code, (map.get(code) ?? 0) + reaction.count)
  }

  return reactionOrder.map((type) => ({
    type,
    icon: iconMap[type],
    count: map.get(type) ?? 0,
  }))
})

const totalReactions = computed(() => summary.value.reduce((acc, item) => acc + item.count, 0))
</script>

<template>
  <div class="d-flex align-center ga-3 text-medium-emphasis">
    <div class="d-flex align-center ga-2">
      <div
        v-for="item in summary"
        :key="item.type"
        class="d-flex align-center ga-1"
      >
        <v-icon size="16" :icon="item.icon" />
        <span class="text-caption">{{ item.count }}</span>
      </div>
    </div>

    <span class="text-caption font-weight-medium">{{ totalReactions }} réactions</span>
  </div>
</template>
