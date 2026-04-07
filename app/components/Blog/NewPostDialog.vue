<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const props = withDefaults(defineProps<{
  modelValue: string
  disabled?: boolean
  open?: boolean
  placeholder?: string
}>(), {
  disabled: false,
  open: false,
  placeholder: 'Was machst du gerade?',
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
const theme = useTheme()
const { user } = useUserSession()
const isLightTheme = computed(() => !theme.current.value.dark)
const sessionUser = computed(() => user.value as SessionUser | null)
const userDisplayName = computed(() => {
  const fullName = [sessionUser.value?.firstName, sessionUser.value?.lastName].filter(Boolean).join(' ').trim()
  return fullName || sessionUser.value?.username || 'Utilisateur'
})
const userAvatar = computed(() => sessionUser.value?.photo || null)
const resolvedPlaceholder = computed(() => `${props.placeholder} ${userDisplayName.value}?`)

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
    <v-card
      class="new-post-dialog"
      :class="{ 'new-post-dialog--light': isLightTheme }"
      rounded="xl"
    >
      <v-card-title class="py-4 d-flex align-center justify-center position-relative">
        <span class="new-post-dialog__title text-h6">Beitrag erstellen</span>
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
            <v-img v-if="userAvatar" :src="userAvatar" />
            <v-icon v-else icon="mdi-account" />
          </v-avatar>

          <div class="d-flex flex-column ga-1">
            <span class="font-weight-bold">{{ userDisplayName }}</span>
            <BlogNewPostAudienceChip :disabled="disabled" />
          </div>
        </div>

        <v-textarea
          v-model="content"
          :disabled="disabled"
          :placeholder="resolvedPlaceholder"
          auto-grow
          rows="6"
          variant="plain"
          hide-details
          class="new-post-dialog__textarea"
        />

        <BlogNewPostAddToPostRow :disabled="disabled" />
      </v-card-text>

      <v-card-actions class="new-post-actions px-6 pb-6">
        <v-btn
          class="new-post-submit"
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

<style scoped lang="scss">
.new-post-dialog {
  --dialog-bg: #1d1f24;
  --dialog-border: rgba(255, 255, 255, 0.16);
  --dialog-radius: 18px;
  --dialog-title-color: rgba(255, 255, 255, 0.96);
  --dialog-placeholder: rgba(255, 255, 255, 0.52);
  --dialog-focus: rgba(255, 255, 255, 0.22);
  --dialog-submit-hover: rgba(255, 255, 255, 0.08);

  background: var(--dialog-bg);
  border: 1px solid var(--dialog-border);
  border-radius: var(--dialog-radius) !important;
}

.new-post-dialog--light {
  --dialog-bg: #ffffff;
  --dialog-border: rgba(15, 23, 42, 0.1);
  --dialog-title-color: rgba(15, 23, 42, 0.94);
  --dialog-placeholder: rgba(15, 23, 42, 0.42);
  --dialog-focus: rgba(37, 99, 235, 0.24);
}

.new-post-dialog__title {
  color: var(--dialog-title-color);
  font-weight: 800;
}

:deep(.new-post-dialog__textarea textarea::placeholder) {
  color: var(--dialog-placeholder);
  font-weight: 500;
}

.new-post-actions {
  padding-top: 4px;
}

.new-post-submit {
  border-radius: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.new-post-submit:hover:not(.v-btn--disabled),
.new-post-submit:focus-visible:not(.v-btn--disabled) {
  box-shadow: inset 0 0 0 1px var(--dialog-focus);
  filter: brightness(1.03);
}
</style>
