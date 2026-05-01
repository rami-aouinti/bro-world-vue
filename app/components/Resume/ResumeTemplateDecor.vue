<script setup lang="ts">
import { computed } from 'vue'

type DecorShapeType = 'circle' | 'square' | 'line' | 'blob'

type DecorElement = {
  type: DecorShapeType
  size: string | number
  color: string
  x: string | number
  y: string | number
  zIndex?: number
}

type ResumeDecorConfig = {
  enabled?: boolean
  zIndex?: number
  elements?: DecorElement[]
}

const props = defineProps<{ decor?: ResumeDecorConfig }>()

const decorElements = computed(() => props.decor?.elements ?? [])
const isDecorEnabled = computed(() => props.decor?.enabled ?? true)
const layerZIndex = computed(() => props.decor?.zIndex ?? 0)

function toCssUnit(value: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}

function elementStyle(element: DecorElement) {
  const size = toCssUnit(element.size)
  const left = typeof element.x === 'number' ? `${element.x}%` : element.x
  const top = typeof element.y === 'number' ? `${element.y}%` : element.y
  const base = {
    left,
    top,
    background: element.color,
    zIndex: String(element.zIndex ?? 0),
  }

  if (element.type === 'line') {
    return {
      ...base,
      width: size,
      height: '2px',
      borderRadius: '999px',
    }
  }

  return {
    ...base,
    width: size,
    height: size,
  }
}
</script>

<template>
  <div
    v-if="isDecorEnabled && decorElements.length"
    class="resume-template-decor"
    :style="{ zIndex: String(layerZIndex) }"
    aria-hidden="true"
  >
    <span
      v-for="(element, index) in decorElements"
      :key="`resume-template-decor-${index}-${element.type}`"
      class="resume-template-decor__item"
      :class="`resume-template-decor__item--${element.type}`"
      :style="elementStyle(element)"
    />
  </div>
</template>

<style scoped>
.resume-template-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.resume-template-decor__item {
  position: absolute;
  opacity: 0.18;
  transform: translate(-50%, -50%);
}

.resume-template-decor__item--circle {
  border-radius: 50%;
}

.resume-template-decor__item--square {
  border-radius: 6px;
}

.resume-template-decor__item--blob {
  border-radius: 44% 56% 62% 38% / 42% 40% 60% 58%;
}

.resume-template-decor__item--line {
  opacity: 0.3;
}
</style>
