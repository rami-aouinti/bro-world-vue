<script setup lang="ts">
import ResumeSectionHeading from '~/components/Resume/Sections/ResumeSectionHeading.vue'
import ResumeSectionHoverToolbar from '~/components/Resume/Sections/ResumeSectionHoverToolbar.vue'

const props = withDefaults(
  defineProps<{
    sectionKey?: string
    title: string
    icon?: string
    tone?: 'default' | 'on-primary'
    showIcon?: boolean
    isEmpty?: boolean
  }>(),
  {
    icon: undefined,
    tone: 'default',
    showIcon: true,
    isEmpty: false,
    sectionKey: '',
  },
)

const emit = defineEmits<{
  (event: 'change-variant', sectionKey: string, variant: string): void
  (event: 'submit-add-item', sectionKey: string, payload: Record<string, string>): void
  (event: 'delete-section', sectionKey: string): void
  (event: 'move-up', sectionKey: string): void
  (event: 'move-down', sectionKey: string): void
}>()

function onChangeVariant(sectionKey: string, variant: string) { emit('change-variant', sectionKey, variant) }
function onSubmitAddItem(sectionKey: string, payload: Record<string, string>) { emit('submit-add-item', sectionKey, payload) }
</script>

<template>
  <ResumeSectionHoverToolbar
    v-if="!isEmpty"
    class="resume-section-block"
    :section-key="props.sectionKey || title"
    @change-variant="onChangeVariant"
    @submit-add-item="onSubmitAddItem"
    @delete-section="emit('delete-section', $event)"
    @move-up="emit('move-up', $event)"
    @move-down="emit('move-down', $event)"
  >
    <template #title>
      <ResumeSectionHeading
        :title="title"
        :icon="icon"
        :tone="tone"
        :show-icon="showIcon"
        variant="h3"
      />
    </template>
    <slot />
  </ResumeSectionHoverToolbar>
</template>

<style scoped>
.resume-section-block {
  display: grid;
  gap: 8px;
}
</style>
