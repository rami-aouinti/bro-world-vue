<script setup lang="ts">
const { t } = useI18n()
const openDialog = ref(false)

function onConfirmAction() {
  openDialog.value = false
  Notify.success(t('dashboard.showcase.modalSuccess'))
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="8">
      <v-card class="pa-5 h-100 showcase-card">
        <v-chip color="primary" variant="tonal" class="mb-4">
          {{ t('dashboard.showcase.badge') }}
        </v-chip>
        <h3 class="text-h5 mb-2">{{ t('dashboard.showcase.title') }}</h3>
        <p class="text-medium-emphasis mb-6">
          {{ t('dashboard.showcase.description') }}
        </p>
        <div class="d-flex flex-wrap ga-3 align-center">
          <v-btn color="primary" size="large" @click="openDialog = true">
            {{ t('dashboard.showcase.openModal') }}
          </v-btn>
          <v-btn variant="outlined" size="large">
            {{ t('dashboard.showcase.secondaryAction') }}
          </v-btn>
          <v-avatar color="primary" variant="tonal" size="44">
            <v-icon icon="mdi-lightning-bolt-outline" />
          </v-avatar>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card class="pa-5 h-100">
        <h4 class="text-subtitle-1 font-weight-bold mb-3">
          {{ t('dashboard.showcase.quickActions') }}
        </h4>
        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-account-group-outline"
            :title="t('dashboard.showcase.actionTeam')"
          />
          <v-list-item
            prepend-icon="mdi-chart-areaspline"
            :title="t('dashboard.showcase.actionStats')"
          />
          <v-list-item
            prepend-icon="mdi-cog-outline"
            :title="t('dashboard.showcase.actionSettings')"
          />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
  <ShowcaseActionModal v-model="openDialog" @confirm="onConfirmAction" />
</template>

<style scoped>
.showcase-card {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.08),
    transparent 45%
  );
}
</style>
