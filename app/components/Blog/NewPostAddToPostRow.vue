<script setup lang="ts">
const { disabled } = withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

const actions = [
  {
    icon: 'mdi-video-wireless',
    colorClass: 'new-post-action--live',
    label: 'Live-Video',
  },
  {
    icon: 'mdi-image-multiple',
    colorClass: 'new-post-action--media',
    label: 'Foto/Video',
  },
  {
    icon: 'mdi-emoticon-happy-outline',
    colorClass: 'new-post-action--feeling',
    label: 'Gefühl/Aktivität',
  },
  {
    icon: 'mdi-tag-outline',
    colorClass: 'new-post-action--tag',
    label: 'Tag',
  },
  {
    icon: 'mdi-gif',
    colorClass: 'new-post-action--gif',
    label: 'GIF',
  },
]
</script>

<template>
  <v-sheet class="new-post-actions px-3 py-2 d-flex align-center justify-space-between ga-2">
    <span class="new-post-actions__label text-body-2">Füge noch etwas zu deinem Beitrag hinzu</span>

    <div class="d-flex ga-1">
      <v-btn
        v-for="action in actions"
        :key="action.label"
        :icon="action.icon"
        :disabled="disabled"
        variant="text"
        size="small"
        :class="action.colorClass"
      />
    </div>
  </v-sheet>
</template>

<style scoped lang="scss">
.new-post-actions {
  --actions-bg: #1d1f24;
  --actions-border: rgba(255, 255, 255, 0.14);
  --actions-radius: 16px;
  --actions-label: rgba(255, 255, 255, 0.78);
  --icon-live: #f3425f;
  --icon-media: #45bd62;
  --icon-feeling: #f7b928;
  --icon-tag: #4b8ef7;
  --icon-gif: #31d7e8;

  background: var(--actions-bg);
  border: 1px solid var(--actions-border);
  border-radius: var(--actions-radius) !important;
}

.new-post-actions__label {
  color: var(--actions-label);
  font-weight: 600;
}

.new-post-action--live {
  color: var(--icon-live);
}

.new-post-action--media {
  color: var(--icon-media);
}

.new-post-action--feeling {
  color: var(--icon-feeling);
}

.new-post-action--tag {
  color: var(--icon-tag);
}

.new-post-action--gif {
  color: var(--icon-gif);
}
</style>
