<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'Contact',
})
</script>

<template>
  <div>
    <PageDrawers>
      <template #left>
        <v-list nav density="compact" class="app-left-drawer-list">
          <v-list-subheader class="text-overline">Contact</v-list-subheader>
          <v-list-item prepend-icon="mdi-headset" title="Support" subtitle="Lun–Ven, 9h–18h" />
          <v-list-item prepend-icon="mdi-calendar-clock" title="Rendez-vous" subtitle="Visio ou sur site" />
          <v-list-item prepend-icon="mdi-email-outline" title="Email" subtitle="Réponse sous 24h" />
        </v-list>
      </template>

      <template #right>
        <v-list nav density="compact" class="app-right-drawer-list">
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="secondary">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-headset" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1">Support client</v-card-title>
                <v-card-subtitle>Lun–Ven, 9h–18h</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                Réponse moyenne en moins de 4 heures ouvrées pour toute demande urgente.
              </v-card-text>
            </v-card>
          </v-list-item>
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="primary">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-calendar-clock" class="me-2" />
                </template>
                <v-card-title class="text-subtitle-1">Prendre rendez-vous</v-card-title>
                <v-card-subtitle>Visio ou sur site</v-card-subtitle>
              </v-card-item>
              <v-card-text class="text-body-2 pt-0">
                Planifiez un créneau de 30 minutes pour discuter de votre projet.
              </v-card-text>
            </v-card>
          </v-list-item>
        </v-list>
      </template>
    </PageDrawers>

    <v-container class="py-12 text-center">
      <h1 class="text-h3 mb-4">{{ t('appbar.contact') }}</h1>
      <p>Contactez-nous pour toute question ou demande de collaboration.</p>
    </v-container>
  </div>
</template>
