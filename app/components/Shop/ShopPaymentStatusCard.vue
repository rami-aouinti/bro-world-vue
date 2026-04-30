<script setup lang="ts">
import type { OrderRecord } from './types'

const props = defineProps<{ order: OrderRecord }>()

const netAmount = computed(
  () => props.order.amount - props.order.refundedAmount,
)
const statusColor = computed(() => {
  if (props.order.status === 'refunded') return 'pink-darken-2'
  if (props.order.status === 'paid' || props.order.status === 'delivered')
    return 'green-darken-1'
  if (props.order.status === 'returned') return 'deep-orange'
  return 'blue-grey'
})
</script>

<template>
  <v-card variant="tonal" :color="statusColor" rounded="lg" class="pa-3 mb-3">
    <div class="text-caption text-uppercase">Payment status</div>
    <div class="text-body-1 font-weight-bold">{{ order.status }}</div>
    <div class="text-caption">
      Net captured: {{ netAmount.toFixed(2) }} {{ order.currency }}
    </div>
  </v-card>
</template>
