<script setup lang="ts">
const { disabled } = withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

const actions = [
  {
    icon: 'mdi-video-wireless',
    color: '#f3425f',
    label: 'Live-Video',
  },
  {
    icon: 'mdi-image-multiple',
    color: '#45bd62',
    label: 'Foto/Video',
  },
  {
    icon: 'mdi-emoticon-happy-outline',
    color: '#f7b928',
    label: 'Gefühl/Aktivität',
  },
]
</script>

<template>
  <v-sheet rounded="lg" border class="px-3 py-2 d-flex align-center justify-space-between ga-2">
    <span class="text-body-2 text-medium-emphasis">Füge noch etwas zu deinem Beitrag hinzu</span>

    <div class="d-flex ga-1">
      <v-btn
        v-for="action in actions"
        :key="action.label"
        :icon="action.icon"
        :disabled="disabled"
        variant="text"
        size="small"
        :color="action.color"
      />
    </div>
  </v-sheet>
</template>
