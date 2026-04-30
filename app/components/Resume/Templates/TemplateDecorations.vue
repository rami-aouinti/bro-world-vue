<script setup lang="ts">
type DecorativeShapeSettings = {
  enabled: boolean
  type: 'circle' | 'square' | 'ring' | 'bar' | 'diamond' | 'triangle' | 'pill'
  width: number
  height: number
  size: number
  color: string
  opacity: number
  x: number
  y: number
  rotation: number
}

const props = defineProps<{ shapes: DecorativeShapeSettings[] }>()

function decorativeShapeStyle(shape: DecorativeShapeSettings) {
  const width =
    shape.type === 'circle' || shape.type === 'ring' || shape.type === 'diamond' || shape.type === 'triangle' ? shape.size : shape.width
  const height =
    shape.type === 'circle' || shape.type === 'ring' || shape.type === 'diamond' || shape.type === 'triangle' ? shape.size : shape.height

  return {
    '--shape-color': shape.color,
    '--shape-opacity': String(shape.opacity),
    width: `${width}px`,
    height: `${height}px`,
    left: `${shape.x}%`,
    top: `${shape.y}%`,
    '--shape-size': `${shape.size}px`,
    transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
  }
}
</script>

<template>
  <div v-if="props.shapes.length" class="resume-skin__decorative-layer" aria-hidden="true">
    <span
      v-for="(shape, index) in props.shapes"
      :key="`resume-shape-${index}-${shape.type}`"
      class="resume-skin__shape"
      :class="`resume-skin__shape--${shape.type}`"
      :style="decorativeShapeStyle(shape)"
    />
  </div>
</template>
