<script setup lang="ts">
defineProps<{
  totalAmount: number
  refundedAmount: number
}>()

const currencyFormat = (value: number) => `${value.toFixed(2)} €`
</script>

<template>
  <v-alert type="info" variant="tonal" class="mb-3">
    Total amount:
    <strong>{{ currencyFormat(totalAmount) }}</strong> •
    Refunded:
    <strong>{{ currencyFormat(refundedAmount) }}</strong>
  </v-alert>
</template>
