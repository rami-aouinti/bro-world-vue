<script setup lang="ts">
definePageMeta({
  title: 'CRM - Documentation',
})

useSeoMeta({
  title: 'CRM World | Documentation complète, synchronisation GitHub et bonnes pratiques',
  description:
    'Découvrez la documentation CRM complète: gestion des projets, tâches, sprints, Kanaban, demandes de tâches, gouvernance admin, et synchronisation GitHub en temps réel.',
  ogTitle:
    'CRM World | Documentation complète, synchronisation GitHub et bonnes pratiques',
  ogDescription:
    'Explorez les fonctionnalités CRM: pipeline projet, Kanaban opérationnel, workflow équipe, synchronisation GitHub bidirectionnelle et pilotage par reporting.',
  twitterCard: 'summary_large_image',
})

const { t } = useI18n()
const activeLanguage = ref('fr')

const documentationVariables = [
  '{{companyName}}',
  '{{projectCode}}',
  '{{sprintGoal}}',
  '{{taskOwner}}',
  '{{dueDate}}',
  '{{githubPrUrl}}',
]

const documentationSections = {
  fr: {
    title: 'Documentation CRM (Français)',
    intro:
      'Ce guide explique comment structurer les opérations CRM avec des variables dynamiques pour standardiser la communication entre Product, Ops et Engineering.',
    blocks: [
      {
        icon: 'mdi-folder-cog-outline',
        title: 'Variables métiers',
        body: 'Utilisez des variables comme {{companyName}} et {{projectCode}} pour générer des descriptions de projet cohérentes et réutilisables.',
      },
      {
        icon: 'mdi-view-column-outline',
        title: 'Rituels Kanaban',
        body: 'L\'équipe suit les colonnes To do / In progress / Review / Done pour fluidifier le delivery et détecter les blocages tôt.',
      },
      {
        icon: 'mdi-github',
        title: 'Références de livraison',
        body: 'Reliez chaque tâche CRM à une référence GitHub (issue, PR ou commit) via {{githubPrUrl}} pour garder une traçabilité complète.',
      },
    ],
  },
  en: {
    title: 'CRM Documentation (English)',
    intro:
      'This guide explains how to run CRM operations with dynamic variables so Product, Ops, and Engineering share one delivery language.',
    blocks: [
      {
        icon: 'mdi-shape-outline',
        title: 'Operational templates',
        body: 'Reusable placeholders such as {{taskOwner}} and {{dueDate}} help teams publish clear and scalable execution notes.',
      },
      {
        icon: 'mdi-chart-timeline-variant',
        title: 'Sprint orchestration',
        body: 'Each sprint is aligned with {{sprintGoal}} and measurable outcomes to improve predictability and stakeholder updates.',
      },
      {
        icon: 'mdi-book-open-page-variant-outline',
        title: 'Reference-first culture',
        body: 'Attach reliable references (product brief, API docs, GitHub links) to each card so decisions remain auditable over time.',
      },
    ],
  },
  es: {
    title: 'Documentación CRM (Español)',
    intro:
      'Esta guía muestra cómo usar variables dinámicas en el CRM para acelerar la ejecución y mantener consistencia entre equipos.',
    blocks: [
      {
        icon: 'mdi-text-box-check-outline',
        title: 'Plantillas con variables',
        body: 'Variables como {{companyName}} y {{taskOwner}} permiten crear instrucciones claras para cada solicitud operativa.',
      },
      {
        icon: 'mdi-account-supervisor-circle-outline',
        title: 'Colaboración transversal',
        body: 'Producto, QA y desarrollo comparten un mismo tablero para priorizar riesgos, avances y entregables.',
      },
      {
        icon: 'mdi-link-variant',
        title: 'Referencias obligatorias',
        body: 'Cada tarea debe incluir enlaces de referencia (brief, endpoint, PR) para reducir ambigüedad y reprocesos.',
      },
    ],
  },
  ar: {
    title: 'توثيق CRM (العربية)',
    intro:
      'يوضح هذا الدليل طريقة إدارة CRM باستخدام متغيرات ديناميكية لضمان توحيد العمل بين الفرق التقنية والوظيفية.',
    blocks: [
      {
        icon: 'mdi-variable',
        title: 'متغيرات موحدة',
        body: 'استخدم متغيرات مثل {{projectCode}} و {{dueDate}} لتكوين تعليمات واضحة وقابلة لإعادة الاستخدام.',
      },
      {
        icon: 'mdi-motion-play-outline',
        title: 'إيقاع تنفيذي سريع',
        body: 'لوحة Kanaban تساعد على رؤية تدفق العمل لحظيًا وتحسين سرعة اتخاذ القرار أثناء السبرنت.',
      },
      {
        icon: 'mdi-clipboard-text-search-outline',
        title: 'توثيق بالمراجع',
        body: 'اربط كل مهمة بمراجع موثوقة مثل روابط GitHub أو وثائق API لتحسين الدقة وإمكانية التدقيق.',
      },
    ],
  },
} as const

const languageOptions = [
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'العربية', value: 'ar' },
]

const activeDoc = computed(() => documentationSections[activeLanguage.value as keyof typeof documentationSections])
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="pa-6 postcard-gradient-card hero-card">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="primary" variant="tonal" size="44">
              <v-icon icon="mdi-account-group-outline" />
            </v-avatar>
            <div>
              <h1 class="text-h5 font-weight-bold mb-1">{{ t('world.crm.label') }}</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Centre de documentation CRM multilingue avec variables dynamiques, références, workflows et design animé.
              </p>
            </div>
          </div>

          <p class="text-body-1 mb-3">
            Le CRM World centralise la gestion opérationnelle des équipes: suivi des projets, pilotage des sprints,
            orchestration des tâches, demandes de sous-tâches et supervision admin.
          </p>
          <p class="text-body-1 mb-0">
            Cette page sert de référence produit. Pour la vue de travail quotidienne en tableau, rendez-vous sur la page
            <NuxtLink to="/world/crm/kanaban" class="text-primary font-weight-medium text-decoration-none">Kanaban</NuxtLink>.
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="xl" class="pa-5 h-100 floating-card">
          <h2 class="text-h6 font-weight-bold mb-3">Variables de documentation</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Utilisez ces variables dans vos templates de tâches, sprints ou briefs pour générer une documentation uniforme.
          </p>
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip
              v-for="variable in documentationVariables"
              :key="variable"
              color="primary"
              variant="tonal"
              class="variable-chip"
            >
              {{ variable }}
            </v-chip>
          </div>
          <v-alert type="info" variant="tonal" border="start" border-color="primary">
            Exemple: « Le projet &#123;&#123;projectCode&#125;&#125; pour &#123;&#123;companyName&#125;&#125; est assigné à &#123;&#123;taskOwner&#125;&#125; avec une échéance au &#123;&#123;dueDate&#125;&#125; ».
          </v-alert>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card rounded="xl" class="pa-5 h-100 floating-card">
          <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-3">
            <h2 class="text-h6 font-weight-bold mb-0">Documentation en 4 langues</h2>
            <v-chip color="success" variant="tonal" prepend-icon="mdi-translate">i18n ready</v-chip>
          </div>

          <v-btn-toggle v-model="activeLanguage" mandatory divided class="mb-4 w-100 language-toggle">
            <v-btn
              v-for="language in languageOptions"
              :key="language.value"
              :value="language.value"
              variant="text"
            >
              {{ language.label }}
            </v-btn>
          </v-btn-toggle>

          <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ activeDoc.title }}</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">{{ activeDoc.intro }}</p>

          <v-row>
            <v-col v-for="block in activeDoc.blocks" :key="block.title" cols="12" class="py-2">
              <v-sheet rounded="lg" class="pa-4 section-card" border>
                <div class="d-flex align-start ga-3">
                  <v-icon :icon="block.icon" color="primary" size="26" class="mt-1" />
                  <div>
                    <h4 class="text-subtitle-2 font-weight-bold mb-1">{{ block.title }}</h4>
                    <p class="text-body-2 mb-0">{{ block.body }}</p>
                  </div>
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card rounded="xl" class="pa-5">
          <h2 class="text-h6 font-weight-bold mb-3">Références recommandées</h2>
          <v-list density="comfortable" class="bg-transparent">
            <v-list-item prepend-icon="mdi-file-document-outline" title="Guide de contribution CRM">
              <template #subtitle>Définissez les conventions de nommage pour &#123;&#123;projectCode&#125;&#125;, les statuts et les priorités.</template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-api" title="Référence API / Endpoints CRM">
              <template #subtitle>Documentez les entrées/sorties des endpoints afin d'aligner frontend, backend et QA.</template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-github" title="Références GitHub">
              <template #subtitle>Associez chaque tâche à une issue, PR ou commit pour un audit transparent.</template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-school-outline" title="Glossaire produit">
              <template #subtitle>Maintenez un glossaire des termes business et techniques utilisés dans le CRM.</template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.hero-card {
  position: relative;
  overflow: hidden;
}

.hero-card::after {
  content: '';
  position: absolute;
  inset: -35% auto auto 60%;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.18) 0%, rgba(255, 255, 255, 0) 70%);
  animation: floatingGlow 7s ease-in-out infinite;
  pointer-events: none;
}

.floating-card {
  animation: cardRise 0.55s ease both;
}

.section-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.variable-chip {
  animation: pulseIn 0.45s ease both;
}

@keyframes cardRise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatingGlow {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-18px);
  }
}

@keyframes pulseIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
