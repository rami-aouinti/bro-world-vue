<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const conversation = computed(() => String(route.params.conversation || ''))

definePageMeta({
  title: 'pages.inbox.detailTitle',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('pages.inbox.detailTitle') }}</v-card-title>
      <v-card-text>
        {{ t('pages.inbox.detailLabel') }}: {{ conversation }}
      </v-card-text>
    </v-card>
  </v-container>
</template>
