<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  disabled?: boolean
  open?: boolean
  placeholder?: string
}>(), {
  disabled: false,
  open: false,
  placeholder: 'Was machst du gerade, Rami?',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:open': [value: boolean]
  submit: [content: string]
}>()

const content = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const isPostDisabled = computed(() => props.disabled || !props.modelValue.trim())

function closeDialog() {
  emit('update:open', false)
}

function onSubmit() {
  if (isPostDisabled.value) {
    return
  }

  emit('submit', props.modelValue.trim())
}
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="640"
    @update:model-value="emit('update:open', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="py-4 d-flex align-center justify-center position-relative">
        <span class="text-h6 font-weight-bold">Beitrag erstellen</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="position-absolute"
          style="right: 12px"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4 d-flex flex-column ga-4">
        <div class="d-flex align-center ga-3">
          <v-avatar size="44" color="grey-darken-2">
            <v-icon icon="mdi-account" />
          </v-avatar>

          <div class="d-flex flex-column ga-1">
            <span class="font-weight-bold">Rami</span>
            <BlogNewPostAudienceChip :disabled="disabled" />
          </div>
        </div>

        <v-textarea
          v-model="content"
          :disabled="disabled"
          :placeholder="placeholder"
          auto-grow
          rows="6"
          variant="plain"
          hide-details
        />

        <BlogNewPostAddToPostRow :disabled="disabled" />
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-btn
          block
          color="primary"
          size="large"
          :disabled="isPostDisabled"
          @click="onSubmit"
        >
          Posten
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
