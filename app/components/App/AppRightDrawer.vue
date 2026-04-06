<script setup lang="ts">
const rightDrawerOpen = useState('right-drawer-open', () => true)

const route = useRoute()

const drawerCardsByRoute = {
  about: [
    {
      title: 'Notre mission',
      subtitle: 'Donner de la clarté',
      text: 'Nous aidons les équipes à transformer des idées complexes en actions simples et mesurables.',
      color: 'primary',
      icon: 'mdi-bullseye-arrow',
    },
    {
      title: 'Nos valeurs',
      subtitle: 'Transparence et impact',
      text: 'Nous privilégions une communication honnête, la collaboration et des résultats utiles au quotidien.',
      color: 'success',
      icon: 'mdi-hand-heart',
    },
  ],
  service: [
    {
      title: 'Audit rapide',
      subtitle: 'En 48h',
      text: 'Analyse de vos besoins et recommandations priorisées pour démarrer rapidement.',
      color: 'info',
      icon: 'mdi-magnify-scan',
    },
    {
      title: 'Accompagnement',
      subtitle: 'Sur mesure',
      text: 'Suivi régulier, ateliers pratiques et feuille de route adaptée à votre équipe.',
      color: 'warning',
      icon: 'mdi-account-group',
    },
  ],
  contact: [
    {
      title: 'Support client',
      subtitle: 'Lun–Ven, 9h–18h',
      text: 'Réponse moyenne en moins de 4 heures ouvrées pour toute demande urgente.',
      color: 'secondary',
      icon: 'mdi-headset',
    },
    {
      title: 'Prendre rendez-vous',
      subtitle: 'Visio ou sur site',
      text: 'Planifiez un créneau de 30 minutes pour discuter de votre projet.',
      color: 'primary',
      icon: 'mdi-calendar-clock',
    },
  ],
} as const

const drawerCards = computed(() => {
  const pageTitle = (route.meta.title || '').toString().toLowerCase()

  if (pageTitle in drawerCardsByRoute) {
    return drawerCardsByRoute[pageTitle as keyof typeof drawerCardsByRoute]
  }

  return []
})
</script>

<template>
  <v-navigation-drawer
    v-model="rightDrawerOpen"
    location="right"
    width="300"
    permanent
    floating
    class="app-right-drawer"
  >
    <v-list nav density="compact" class="app-right-drawer-list">
      <v-list-item
        v-for="card in drawerCards"
        :key="card.title"
        class="px-0 mb-3"
      >
        <v-card rounded="xl" variant="tonal" :color="card.color">
          <v-card-item>
            <template #prepend>
              <v-icon :icon="card.icon" class="me-2" />
            </template>
            <v-card-title class="text-subtitle-1">
              {{ card.title }}
            </v-card-title>
            <v-card-subtitle>
              {{ card.subtitle }}
            </v-card-subtitle>
          </v-card-item>
          <v-card-text class="text-body-2 pt-0">
            {{ card.text }}
          </v-card-text>
        </v-card>
      </v-list-item>
    </v-list>
    <v-spacer />
    <template #append>
      <v-list-item class="drawer-footer px-0" />
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.app-right-drawer {
  border-radius: 24px;
  margin-top: 56px;
  margin-right: 16px;
  height: calc(100% - 72px);
}

.app-right-drawer-list {
  height: calc(100% - 96px);
  min-height: calc(100% - 96px);
  max-height: calc(100% - 96px);
  overflow-y: auto;
}
</style>
