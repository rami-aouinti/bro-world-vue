<script setup lang="ts">
import { resolveCvIconAsset } from '~/utils/cvIconAssets'

const props = withDefaults(
  defineProps<{
    icon?: string
    size?: string | number
  }>(),
  { icon: '', size: 16 },
)

const iconUrl = computed(() => resolveCvIconAsset(props.icon))
const normalizedSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size,
)
const maskStyle = computed(() => ({
  '--cv-svg-icon-url': iconUrl.value ? `url("${iconUrl.value}")` : undefined,
  '--cv-svg-icon-size': normalizedSize.value,
}))
</script>

<template>
  <span
    v-if="iconUrl"
    class="cv-svg-icon"
    :style="maskStyle"
    aria-hidden="true"
  />
  <v-icon v-else :icon="icon" :size="size" />
</template>

<style scoped>
.cv-svg-icon {
  display: inline-block;
  width: var(--cv-svg-icon-size, 16px);
  height: var(--cv-svg-icon-size, 16px);
  flex: 0 0 var(--cv-svg-icon-size, 16px);
  background: currentColor;
  mask: var(--cv-svg-icon-url) center / contain no-repeat;
  -webkit-mask: var(--cv-svg-icon-url) center / contain no-repeat;
  vertical-align: -0.125em;
}
</style>
