<script setup lang="ts">
defineProps<{
  totalAmount: number
  refundedAmount: number
}>()

const currencyFormat = (value: number) => `${value.toFixed(2)} €`
</script>

<template>
  <v-alert type="info" variant="tonal" class="mb-3">
    Montant total:
    <strong>{{ currencyFormat(totalAmount) }}</strong> •
    Remboursé:
    <strong>{{ currencyFormat(refundedAmount) }}</strong>
  </v-alert>
</template>
