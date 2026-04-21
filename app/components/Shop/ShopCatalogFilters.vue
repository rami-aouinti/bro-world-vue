<script setup lang="ts">
import type { ChannelOption, OrderStatusMeta } from './types'

export type ShopOrdersFiltersModel = {
  search: string
  status: string
  channel: string
  dateFrom: string
  dateTo: string
  amountMin: number | null
  amountMax: number | null
}

const props = defineProps<{
  modelValue: ShopOrdersFiltersModel
  statusCatalog: OrderStatusMeta[]
  channelCatalog: ChannelOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ShopOrdersFiltersModel]
  reset: []
  export: []
}>()

const local = computed({
  get: () => props.modelValue,
  set: (value: ShopOrdersFiltersModel) => emit('update:modelValue', value),
})
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-3">
      <slot name="heading" />
      <div class="d-flex ga-2 flex-wrap">
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-filter-off-outline"
          @click="emit('reset')"
        >
          Reset filters
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-file-delimited-outline"
          @click="emit('export')"
        >
          Export CSV
        </v-btn>
      </div>
    </div>

    <v-row class="mb-2">
      <v-col cols="12" md="3">
        <v-text-field
          v-model="local.search"
          label="Search order/customer"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="2">
        <AppSelect
          v-model="local.status"
          :items="statusCatalog"
          item-title="title"
          item-value="value"
          label="Status"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="2">
        <AppSelect
          v-model="local.channel"
          :items="channelCatalog"
          item-title="title"
          item-value="value"
          label="Channel"
          density="comfortable"
        />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field
          v-model="local.dateFrom"
          label="From"
          type="date"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field
          v-model="local.dateTo"
          label="To"
          type="date"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="6" md="1">
        <v-text-field
          v-model.number="local.amountMin"
          label="Min €"
          type="number"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="6" md="1">
        <v-text-field
          v-model.number="local.amountMax"
          label="Max €"
          type="number"
          density="comfortable"
          hide-details
        />
      </v-col>
    </v-row>
  </div>
</template>
