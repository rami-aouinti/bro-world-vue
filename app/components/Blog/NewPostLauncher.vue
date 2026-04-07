<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
  placeholder?: string
}>(), {
  disabled: false,
  placeholder: 'Was machst du gerade, Rami?',
})

const emit = defineEmits<{
  open: []
}>()

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

function openComposer() {
  if (props.disabled) {
    return
  }

  emit('open')
}
</script>

<template>
  <v-sheet
    rounded="xl"
    color="grey-darken-4"
    class="px-4 py-3 d-flex align-center ga-3"
    border
  >
    <v-avatar size="40" color="grey-darken-2">
      <v-icon icon="mdi-account" />
    </v-avatar>

    <v-btn
      class="flex-grow-1 justify-start text-none"
      variant="tonal"
      rounded="pill"
      color="grey-darken-2"
      :disabled="disabled"
      @click="openComposer"
    >
      <span class="text-medium-emphasis">{{ placeholder }}</span>
    </v-btn>

    <div class="d-flex ga-1">
      <v-btn
        v-for="action in actions"
        :key="action.label"
        :icon="action.icon"
        variant="text"
        size="small"
        :disabled="disabled"
        :color="action.color"
        @click="openComposer"
      />
    </div>
  </v-sheet>
</template>
