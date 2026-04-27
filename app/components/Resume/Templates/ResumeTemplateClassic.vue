<script setup lang="ts">
import { RESUME_TEMPLATE_SKINS } from '~/constants/resumeTemplateSkins'

type SectionKey = 'experience' | 'education' | 'language' | 'project'
type SectionLayoutEntry = { key: SectionKey; variant: string; region: 'main' | 'aside'; order?: number }

const { resume, showPhoto, editable, onPhotoClick, sectionLayout, sectionVariants, themeTokens } = withDefaults(defineProps<{
  resume: any
  showPhoto?: boolean
  editable?: boolean
  onPhotoClick?: () => void
  sectionLayout?: SectionLayoutEntry[]
  sectionVariants?: Partial<Record<SectionKey, string>>
  themeTokens?: Record<string, string>
}>(), {
  showPhoto: true,
  editable: false,
  onPhotoClick: undefined,
  sectionLayout: () => [],
  sectionVariants: () => ({}),
  themeTokens: () => ({}),
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: SectionKey): void
  (event: 'change-variant', sectionKey: SectionKey, variant: string): void
  (event: 'move-section', sectionKey: SectionKey, direction: 'up' | 'down'): void
}>()


function forwardAddItem(sectionKey: SectionKey) {
  emit('add-item', sectionKey)
}

function forwardChangeVariant(sectionKey: SectionKey, variantValue: string) {
  emit('change-variant', sectionKey, variantValue)
}

function forwardMoveSection(sectionKey: SectionKey, direction: 'up' | 'down') {
  emit('move-section', sectionKey, direction)
}

const templateSkin = computed(() => RESUME_TEMPLATE_SKINS['classic'])
</script>

<template>
  <ResumeRenderer
    :resume="resume"
    :show-photo="showPhoto"
    :editable="editable"
    :on-photo-click="onPhotoClick"
    :section-layout="sectionLayout"
    :section-variants="sectionVariants"
    :theme-tokens="themeTokens"
    :template-skin="templateSkin"
    @add-item="forwardAddItem"
    @change-variant="forwardChangeVariant"
    @move-section="forwardMoveSection"
  />
</template>
