<script setup lang="ts">
import ResumeRendererBase from '~/components/Resume/Templates/ResumeRenderer.vue'
import { resolveTemplateSkin } from '~/constants/resumeTemplateSkins'
import type { ResumeTemplateSkin } from '~/constants/resumeTemplateSkins'
import { resolveSectionRenderer } from '../renderers/sections/sectionRendererRegistry'
import type {
  ResumeSectionRendererKey,
  ResumeSectionRendererVariant,
} from '../renderers/sections/types'
import { validateTemplateConfig } from '../template/template.schema'
import { resolveCompatibilityTemplateConfig } from '../template/templateCompatibility'

const props = defineProps<{
  resumeData?: any
  resume?: any
  templateConfig?: {
    templateId?: string
    structureId?: string
    layoutId?: string
    skinId?: string
    layoutMode?: 'aside-left' | 'aside-right' | 'no-aside'
  }
  compatibilityTemplateId?: string
  section?: ResumeSectionRendererKey
  sectionVariant?: ResumeSectionRendererVariant | string
  items?: unknown[]
  theme?: Record<string, string | number>
  showIcon?: boolean
  density?: 'compact' | 'normal' | 'spacious' | string
}>()

const SAFE_TEMPLATE_ID = 'classic'

const normalizedTemplateConfig = computed(() => {
  const compatibilityTemplateConfig = resolveCompatibilityTemplateConfig(
    props.compatibilityTemplateId,
  )

  const rawConfig = {
    ...(compatibilityTemplateConfig || {}),
    ...(props.templateConfig || {}),
    structure:
      props.templateConfig?.structureId ||
      compatibilityTemplateConfig?.structureId,
    layout:
      props.templateConfig?.layoutId || compatibilityTemplateConfig?.layoutId,
  }
  return validateTemplateConfig(rawConfig)
})

const resolvedTemplateId = computed(() => {
  const candidate =
    normalizedTemplateConfig.value.templateId ||
    normalizedTemplateConfig.value.skinId ||
    SAFE_TEMPLATE_ID
  try {
    const skin = resolveTemplateSkin(candidate)
    return skin.id ? candidate : SAFE_TEMPLATE_ID
  } catch {
    return SAFE_TEMPLATE_ID
  }
})

const resolvedTemplateSkin = computed<ResumeTemplateSkin>(() => {
  try {
    return resolveTemplateSkin(resolvedTemplateId.value)
  } catch {
    return resolveTemplateSkin(SAFE_TEMPLATE_ID)
  }
})

const mergedResume = computed(() => ({
  ...(props.resumeData || props.resume || {}),
  template: {
    ...(props.resumeData?.template || props.resume?.template || {}),
    structureId:
      normalizedTemplateConfig.value.structure ||
      props.resumeData?.template?.structureId ||
      props.resume?.template?.structureId,
    layoutId:
      normalizedTemplateConfig.value.layout ||
      props.resumeData?.template?.layoutId ||
      props.resume?.template?.layoutId,
    skinId: normalizedTemplateConfig.value.skinId || resolvedTemplateId.value,
  },
}))

const atomicSectionRenderer = computed(() => {
  if (!props.section) return null
  return resolveSectionRenderer(
    props.section,
    props.sectionVariant ?? 'classic',
  )
})
</script>

<template>
  <component
    :is="atomicSectionRenderer"
    v-if="atomicSectionRenderer"
    :items="items"
    :theme="theme"
    :show-icon="showIcon"
    :density="density"
  />
  <ResumeRendererBase
    v-else
    v-bind="$attrs"
    :resume="mergedResume"
    :template-id="resolvedTemplateId"
    :template-skin="resolvedTemplateSkin"
    :layout-mode="normalizedTemplateConfig.layoutMode"
  />
</template>
