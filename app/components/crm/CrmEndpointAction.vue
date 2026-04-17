<script setup lang="ts">
interface CrmEndpointActionConfig {
  id: string
  title: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  description?: string
  defaultQuery?: Record<string, unknown>
  defaultBody?: Record<string, unknown>
}

const props = defineProps<{
  config: CrmEndpointActionConfig
}>()

const { t } = useI18n()

const routeParams = reactive<Record<string, string>>({})
const queryText = ref(JSON.stringify(props.config.defaultQuery ?? {}, null, 2))
const bodyText = ref(JSON.stringify(props.config.defaultBody ?? {}, null, 2))
const pending = ref(false)
const status = ref<number | null>(null)
const responseText = ref('')
const errorText = ref('')

const pathParams = computed(() => {
  const matches = props.config.path.matchAll(/\{([^}]+)\}/g)
  return Array.from(matches)
    .map((match) => match[1])
    .filter((param): param is string => typeof param === 'string' && param.length > 0)
})

for (const param of pathParams.value) {
  if (!(param in routeParams)) {
    routeParams[param] = ''
  }
}

const hasBody = computed(() => ['POST', 'PATCH', 'PUT'].includes(props.config.method))

function parseJsonOrEmpty(input: string) {
  const trimmed = input.trim()

  if (!trimmed) {
    return undefined
  }

  return JSON.parse(trimmed) as Record<string, unknown>
}

function buildPath() {
  return pathParams.value.reduce((path, param) => {
    const rawValue = routeParams[param]?.trim()
    if (!rawValue) {
      throw new Error(t('crm.components.endpointAction.errors.missingRouteParam', { param }))
    }

    return path.replace(`{${param}}`, encodeURIComponent(rawValue))
  }, props.config.path)
}

async function execute() {
  pending.value = true
  status.value = null
  responseText.value = ''
  errorText.value = ''

  try {
    const query = parseJsonOrEmpty(queryText.value)
    const body = hasBody.value ? parseJsonOrEmpty(bodyText.value) : undefined
    const endpoint = buildPath()

    const result = await $fetch.raw(endpoint, {
      method: props.config.method,
      query,
      body,
    })

    status.value = result.status
    responseText.value =
      result._data === null || result._data === undefined
        ? t('crm.components.endpointAction.response.empty')
        : typeof result._data === 'string'
          ? result._data
          : JSON.stringify(result._data, null, 2)
  } catch (error) {
    errorText.value =
      error instanceof Error
        ? error.message
        : t('crm.components.endpointAction.errors.unknownExecution')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <v-card rounded="xl" class="pa-4 h-100 postcard-gradient-card">
    <div class="d-flex align-center justify-space-between ga-2 mb-2">
      <div>
        <p class="text-subtitle-1 mb-0">{{ config.title }}</p>
        <p class="text-caption text-medium-emphasis mb-0">{{ config.path }}</p>
      </div>
      <v-chip :color="config.method === 'GET' ? 'primary' : 'secondary'" size="small">
        {{ config.method }}
      </v-chip>
    </div>

    <p v-if="config.description" class="text-body-2 text-medium-emphasis mb-3">
      {{ config.description }}
    </p>

    <v-row v-if="pathParams.length > 0" class="mb-1">
      <v-col v-for="param in pathParams" :key="param" cols="12" md="6">
        <v-text-field
          v-model="routeParams[param]"
          :label="t('crm.components.endpointAction.fields.param', { param })"
          density="comfortable"
          variant="outlined"
          hide-details
        />
      </v-col>
    </v-row>

    <v-textarea
      v-model="queryText"
      :label="t('crm.components.endpointAction.fields.queryJson')"
      rows="3"
      auto-grow
      variant="outlined"
      class="mb-2"
      :hint="t('crm.components.endpointAction.fields.queryHint')"
      persistent-hint
    />

    <v-textarea
      v-if="hasBody"
      v-model="bodyText"
      :label="t('crm.components.endpointAction.fields.bodyJson')"
      rows="5"
      auto-grow
      variant="outlined"
      class="mb-2"
      :hint="t('crm.components.endpointAction.fields.bodyHint')"
      persistent-hint
    />

    <div class="d-flex align-center ga-2 mb-2">
      <v-btn color="primary" :loading="pending" prepend-icon="mdi-send" @click="execute">
        {{ t('crm.components.endpointAction.actions.execute') }}
      </v-btn>
      <v-chip v-if="status" color="success" variant="tonal">
        {{ t('crm.components.endpointAction.status.label', { status }) }}
      </v-chip>
    </div>

    <v-alert v-if="errorText" type="error" variant="tonal" class="mb-2">
      {{ errorText }}
    </v-alert>

    <v-textarea
      v-if="responseText"
      :model-value="responseText"
      :label="t('crm.components.endpointAction.fields.response')"
      readonly
      rows="5"
      auto-grow
      variant="outlined"
    />
  </v-card>
</template>
