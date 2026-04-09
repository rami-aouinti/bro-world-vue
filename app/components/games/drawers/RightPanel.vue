<script setup lang="ts">
type SelectionEntry = {
  key: string
  icon: string
  label: string
  value: string
}

const props = defineProps<{
  selection?: SelectionEntry[]
}>()

const { t } = useI18n()

const instructionLines = computed(() => [
  t('gamePage.drawer.instructions.line1'),
  t('gamePage.drawer.instructions.line2'),
  t('gamePage.drawer.instructions.line3'),
  t('gamePage.drawer.instructions.line4'),
])

const visibleSelection = computed(() =>
  (props.selection ?? []).filter((item) => Boolean(item.value)),
)
</script>

<template>
  <div class="games-right-panel">
    <v-list nav density="compact" class="app-right-drawer-list">
      <v-list-subheader>
        {{ t('gamePage.drawer.instructions.title') }}
      </v-list-subheader>

      <v-list-item
        v-for="(line, index) in instructionLines"
        :key="`instruction-${index + 1}`"
      >
        <template #prepend>
          <v-chip size="x-small" variant="tonal" color="primary" label>
            {{ index + 1 }}
          </v-chip>
        </template>
        <v-list-item-title class="games-right-panel__instruction-line">
          {{ line }}
        </v-list-item-title>
      </v-list-item>

      <template v-if="visibleSelection.length">
        <v-divider class="my-2" />

        <v-list-subheader>
          {{ t('gamePage.selection.summaryTitle') }}
        </v-list-subheader>

        <v-list-item
          v-for="item in visibleSelection"
          :key="item.key"
          :title="item.label"
          :subtitle="item.value"
        >
          <template #prepend>
            <v-icon :icon="item.icon" />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<style scoped>
.games-right-panel {
  height: 100%;
}

.games-right-panel__instruction-line {
  white-space: normal;
  line-height: 1.35rem;
}
</style>
