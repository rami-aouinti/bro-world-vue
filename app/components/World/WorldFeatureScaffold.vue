<script setup lang="ts">
type SelectOption = { title: string, value: string }

type FormField = {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'email'
  placeholder?: string
  options?: SelectOption[]
}

type TableHeader = { title: string, key: string }

const props = withDefaults(defineProps<{
  title: string
  subtitle: string
  formTitle: string
  formDescription: string
  fields: FormField[]
  headers: TableHeader[]
  rows: Record<string, string | number>[]
  createLabel?: string
}>(), {
  createLabel: 'Save record',
})

const search = ref('')
const form = reactive<Record<string, string | number>>({})

for (const field of props.fields) {
  form[field.key] = ''
}

const filteredRows = computed(() => {
  if (!search.value) return props.rows

  return props.rows.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(search.value.toLowerCase()),
  )
})
</script>

<template>
  <v-row class="ga-0">
    <v-col cols="12" lg="7" class="pr-lg-3">
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
          <div>
            <h1 class="text-h5 mb-1">{{ title }}</h1>
            <p class="text-medium-emphasis mb-0">{{ subtitle }}</p>
          </div>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 280px"
          />
        </div>

        <v-data-table
          :headers="headers"
          :items="filteredRows"
          item-value="id"
          density="comfortable"
          class="bg-transparent"
        />
      </v-card>
    </v-col>

    <v-col cols="12" lg="5" class="pl-lg-3">
      <v-card rounded="xl" class="pa-4 postcard-gradient-card">
        <h2 class="text-h6 mb-1">{{ formTitle }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ formDescription }}</p>

        <v-row>
          <v-col
            v-for="field in fields"
            :key="field.key"
            cols="12"
            :md="field.type === 'textarea' ? 12 : 6"
          >
            <v-select
              v-if="field.type === 'select'"
              v-model="form[field.key]"
              :label="field.label"
              :items="field.options || []"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-textarea
              v-else-if="field.type === 'textarea'"
              v-model="form[field.key]"
              :label="field.label"
              :placeholder="field.placeholder"
              variant="outlined"
              rows="3"
              auto-grow
              hide-details
            />
            <v-text-field
              v-else
              v-model="form[field.key]"
              :label="field.label"
              :type="field.type"
              :placeholder="field.placeholder"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </v-col>
        </v-row>

        <v-btn color="primary" prepend-icon="mdi-content-save-outline" class="mt-4" block>
          {{ createLabel }}
        </v-btn>
      </v-card>
    </v-col>
  </v-row>
</template>
