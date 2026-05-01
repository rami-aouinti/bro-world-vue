<script setup lang="ts">
import { computed } from 'vue'

type DecorShapeType = 'circle' | 'square' | 'line' | 'blob' | 'triangle'

type DecorElement = {
  shape?: DecorShapeType | string
  type?: DecorShapeType | string
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

const decorElements = computed(() => props.decor?.corners ?? props.decor?.elements ?? [])
const isDecorEnabled = computed(() => props.decor?.enabled ?? true)
const layerZIndex = computed(() => props.decor?.zIndex ?? 0)

function toCssUnit(value: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}

function elementStyle(element: DecorElement) {
  const shape = (element.shape ?? element.type ?? 'circle').toString()
  const size = toCssUnit(element.size)
  const left = resolveAxisPosition(element.x, 'horizontal')
  const top = resolveAxisPosition(element.y, 'vertical')
  const base = {
    left,
    top,
    background: element.color,
    zIndex: String(element.zIndex ?? 0),
  }

  if (shape === 'line') {
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

function resolveAxisPosition(
  value: string | number,
  axis: 'horizontal' | 'vertical',
): string {
  if (typeof value === 'number') return `${value}%`
  if (/^-?\d+(\.\d+)?$/.test(value)) return `${value}%`
  if (value.includes('%') || value.includes('px')) return value
  const tokens = value.toLowerCase().split('-')
  if (axis === 'horizontal') {
    if (tokens.includes('left')) return '0%'
    if (tokens.includes('right')) return '100%'
  }
  if (axis === 'vertical') {
    if (tokens.includes('top')) return '0%'
    if (tokens.includes('bottom')) return '100%'
  }
  return '50%'
}

function elementShapeClass(element: DecorElement) {
  return (element.shape ?? element.type ?? 'circle').toString()
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
      :key="`resume-template-decor-${index}-${elementShapeClass(element)}`"
      class="resume-template-decor__item"
      :class="`resume-template-decor__item--${elementShapeClass(element)}`"
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

.resume-template-decor__item--triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.resume-template-decor__item--line {
  opacity: 0.3;
}
</style>
