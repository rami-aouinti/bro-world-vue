<script setup lang="ts">
import ResumeRendererBase from '~/components/Resume/Templates/ResumeRenderer.vue'
import { resolveTemplateSkin } from '~/constants/resumeTemplateSkins'
import type { ResumeTemplateSkin } from '~/constants/resumeTemplateSkins'

const props = defineProps<{
  resumeData: any
  templateConfig?: {
    templateId?: string
    structureId?: string
    layoutId?: string
    skinId?: string
    layoutMode?: 'aside-left' | 'aside-right' | 'no-aside'
  }
}>()

const SAFE_TEMPLATE_ID = 'classic'

const resolvedTemplateId = computed(() => {
  const candidate = props.templateConfig?.templateId || props.templateConfig?.skinId || SAFE_TEMPLATE_ID
  try {
    const skin = resolveTemplateSkin(candidate)
    return skin.id ? candidate : SAFE_TEMPLATE_ID
  }
  catch {
    return SAFE_TEMPLATE_ID
  }
})

const resolvedTemplateSkin = computed<ResumeTemplateSkin>(() => {
  try {
    return resolveTemplateSkin(resolvedTemplateId.value)
  }
  catch {
    return resolveTemplateSkin(SAFE_TEMPLATE_ID)
  }
})

const mergedResume = computed(() => ({
  ...(props.resumeData || {}),
  template: {
    ...(props.resumeData?.template || {}),
    structureId: props.templateConfig?.structureId || props.resumeData?.template?.structureId,
    layoutId: props.templateConfig?.layoutId || props.resumeData?.template?.layoutId,
    skinId: props.templateConfig?.skinId || resolvedTemplateId.value,
  },
}))
</script>

<template>
  <ResumeRendererBase
    v-bind="$attrs"
    :resume="mergedResume"
    :template-id="resolvedTemplateId"
    :template-skin="resolvedTemplateSkin"
    :layout-mode="templateConfig?.layoutMode"
  />
</template>
