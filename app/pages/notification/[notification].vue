<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const notification = computed(() => String(route.params.notification || ''))

definePageMeta({
  title: 'pages.notification.detailTitle',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('pages.notification.detailTitle') }}</v-card-title>
      <v-card-text>
        {{ t('pages.notification.detailLabel') }}: {{ notification }}
      </v-card-text>
    </v-card>
  </v-container>
</template>
