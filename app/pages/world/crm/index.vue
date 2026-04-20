<script setup lang="ts">
import { useWorldCrmNavItems } from '~/composables/useWorldCrmNavItems'

definePageMeta({
  title: 'world.crm.label',
})

const { t, locale } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()

const supportedDocLanguages = ['fr', 'en', 'es', 'de'] as const
const activeLanguage = ref<(typeof supportedDocLanguages)[number]>('en')

watchEffect(() => {
  const currentLocale = locale.value as (typeof supportedDocLanguages)[number]
  activeLanguage.value = supportedDocLanguages.includes(currentLocale)
    ? currentLocale
    : 'en'
})

const documentationVariables = [
  '{{companyName}}',
  '{{projectCode}}',
  '{{sprintGoal}}',
  '{{taskOwner}}',
  '{{dueDate}}',
  '{{githubPrUrl}}',
]

const docsByLanguage = {
  fr: {
    heroSubtitle:
      'Centre de documentation CRM multilingue avec variables dynamiques, références, workflows et design animé.',
    heroBodyA:
      'Le CRM World centralise la gestion opérationnelle des équipes: suivi des projets, pilotage des sprints, orchestration des tâches, demandes de sous-tâches et supervision admin.',
    heroBodyBPrefix:
      'Cette page sert de référence produit. Pour la vue de travail quotidienne en tableau, rendez-vous sur la page',
    documentationVariablesTitle: 'Variables de documentation',
    documentationVariablesText:
      'Utilisez ces variables dans vos templates de tâches, sprints ou briefs pour générer une documentation uniforme.',
    documentationExample:
      'Exemple: « Le projet {{projectCode}} pour {{companyName}} est assigné à {{taskOwner}} avec une échéance au {{dueDate}} ».',
    docs4Title: 'Documentation en 4 langues',
    documentationTitle: 'Documentation CRM (Français)',
    intro:
      'Ce guide explique comment structurer les opérations CRM avec des variables dynamiques pour standardiser la communication entre Product, Ops et Engineering.',
    recommendedReferences: 'Références recommandées',
    references: [
      {
        title: 'Guide de contribution CRM',
        subtitle:
          'Définissez les conventions de nommage pour {{projectCode}}, les statuts et les priorités.',
      },
      {
        title: 'Référence API / Endpoints CRM',
        subtitle:
          "Documentez les entrées/sorties des endpoints afin d'aligner frontend, backend et QA.",
      },
      {
        title: 'Références GitHub',
        subtitle:
          'Associez chaque tâche à une issue, PR ou commit pour un audit transparent.',
      },
      {
        title: 'Glossaire produit',
        subtitle:
          'Maintenez un glossaire des termes business et techniques utilisés dans le CRM.',
      },
    ],
    blocks: [
      {
        icon: 'mdi-folder-cog-outline',
        title: 'Variables métiers',
        body: 'Utilisez des variables comme {{companyName}} et {{projectCode}} pour générer des descriptions de projet cohérentes et réutilisables.',
      },
      {
        icon: 'mdi-view-column-outline',
        title: 'Rituels Kanaban',
        body: "L'équipe suit les colonnes To do / In progress / Review / Done pour fluidifier le delivery et détecter les blocages tôt.",
      },
      {
        icon: 'mdi-github',
        title: 'Références de livraison',
        body: 'Reliez chaque tâche CRM à une référence GitHub (issue, PR ou commit) via {{githubPrUrl}} pour garder une traçabilité complète.',
      },
    ],
  },
  en: {
    heroSubtitle:
      'Multilingual CRM documentation hub with dynamic variables, references, workflows, and animated design.',
    heroBodyA:
      'CRM World centralizes team operations: project tracking, sprint steering, task orchestration, sub-task requests, and admin supervision.',
    heroBodyBPrefix:
      'This page is the product reference. For daily board execution, go to the',
    documentationVariablesTitle: 'Documentation variables',
    documentationVariablesText:
      'Use these variables in task, sprint, or brief templates to generate consistent documentation.',
    documentationExample:
      'Example: "Project {{projectCode}} for {{companyName}} is assigned to {{taskOwner}} with a due date of {{dueDate}}."',
    docs4Title: 'Documentation in 4 languages',
    documentationTitle: 'CRM Documentation (English)',
    intro:
      'This guide explains how to run CRM operations with dynamic variables so Product, Ops, and Engineering share one delivery language.',
    recommendedReferences: 'Recommended references',
    references: [
      {
        title: 'CRM contribution guide',
        subtitle:
          'Define naming conventions for {{projectCode}}, statuses, and priorities.',
      },
      {
        title: 'API / CRM endpoints reference',
        subtitle:
          'Document endpoint inputs/outputs to align frontend, backend, and QA.',
      },
      {
        title: 'GitHub references',
        subtitle:
          'Link each task to an issue, PR, or commit for transparent auditing.',
      },
      {
        title: 'Product glossary',
        subtitle:
          'Maintain a glossary of business and technical terms used in CRM.',
      },
    ],
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
    heroSubtitle:
      'Centro de documentación CRM multilingüe con variables dinámicas, referencias, flujos y diseño animado.',
    heroBodyA:
      'CRM World centraliza la operación de los equipos: seguimiento de proyectos, control de sprints, orquestación de tareas, solicitudes de subtareas y supervisión admin.',
    heroBodyBPrefix:
      'Esta página es la referencia del producto. Para la ejecución diaria en tablero, visita la página',
    documentationVariablesTitle: 'Variables de documentación',
    documentationVariablesText:
      'Usa estas variables en plantillas de tareas, sprints o briefs para generar documentación homogénea.',
    documentationExample:
      'Ejemplo: «El proyecto {{projectCode}} para {{companyName}} está asignado a {{taskOwner}} con fecha límite {{dueDate}}».',
    docs4Title: 'Documentación en 4 idiomas',
    documentationTitle: 'Documentación CRM (Español)',
    intro:
      'Esta guía muestra cómo usar variables dinámicas en el CRM para acelerar la ejecución y mantener consistencia entre equipos.',
    recommendedReferences: 'Referencias recomendadas',
    references: [
      {
        title: 'Guía de contribución CRM',
        subtitle:
          'Define convenciones de nombres para {{projectCode}}, estados y prioridades.',
      },
      {
        title: 'Referencia API / Endpoints CRM',
        subtitle:
          'Documenta entradas/salidas de endpoints para alinear frontend, backend y QA.',
      },
      {
        title: 'Referencias GitHub',
        subtitle:
          'Vincula cada tarea con una issue, PR o commit para una auditoría transparente.',
      },
      {
        title: 'Glosario de producto',
        subtitle:
          'Mantén un glosario de términos de negocio y técnicos usados en CRM.',
      },
    ],
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
  de: {
    heroSubtitle:
      'Mehrsprachiges CRM-Dokumentationszentrum mit dynamischen Variablen, Referenzen, Workflows und animiertem Design.',
    heroBodyA:
      'CRM World bündelt die operative Teamarbeit: Projekttracking, Sprint-Steuerung, Aufgaben-Orchestrierung, Unteraufgaben-Anfragen und Admin-Überwachung.',
    heroBodyBPrefix:
      'Diese Seite ist die Produktreferenz. Für die tägliche Board-Ansicht gehe zur',
    documentationVariablesTitle: 'Dokumentationsvariablen',
    documentationVariablesText:
      'Nutze diese Variablen in Task-, Sprint- oder Briefing-Templates für einheitliche Dokumentation.',
    documentationExample:
      'Beispiel: „Projekt {{projectCode}} für {{companyName}} ist {{taskOwner}} zugewiesen mit Fälligkeitsdatum {{dueDate}}.“',
    docs4Title: 'Dokumentation in 4 Sprachen',
    documentationTitle: 'CRM-Dokumentation (Deutsch)',
    intro:
      'Diese Anleitung zeigt, wie CRM-Prozesse mit dynamischen Variablen standardisiert werden, damit Product, Ops und Engineering dieselbe Sprache nutzen.',
    recommendedReferences: 'Empfohlene Referenzen',
    references: [
      {
        title: 'CRM-Beitragsleitfaden',
        subtitle:
          'Definiere Namenskonventionen für {{projectCode}}, Status und Prioritäten.',
      },
      {
        title: 'API- / CRM-Endpunkt-Referenz',
        subtitle:
          'Dokumentiere Ein- und Ausgaben der Endpunkte zur Abstimmung von Frontend, Backend und QA.',
      },
      {
        title: 'GitHub-Referenzen',
        subtitle:
          'Verknüpfe jede Aufgabe mit Issue, PR oder Commit für transparente Audits.',
      },
      {
        title: 'Produkt-Glossar',
        subtitle:
          'Pflege ein Glossar der geschäftlichen und technischen CRM-Begriffe.',
      },
    ],
    blocks: [
      {
        icon: 'mdi-shape-outline',
        title: 'Operative Vorlagen',
        body: 'Wiederverwendbare Platzhalter wie {{taskOwner}} und {{dueDate}} helfen bei klaren und skalierbaren Ausführungsnotizen.',
      },
      {
        icon: 'mdi-chart-timeline-variant',
        title: 'Sprint-Orchestrierung',
        body: 'Jeder Sprint wird an {{sprintGoal}} und messbaren Ergebnissen ausgerichtet, um Planbarkeit zu erhöhen.',
      },
      {
        icon: 'mdi-book-open-page-variant-outline',
        title: 'Referenzorientierte Kultur',
        body: 'Hänge verlässliche Referenzen (Produktbriefing, API-Doku, GitHub-Links) an jede Karte, damit Entscheidungen nachvollziehbar bleiben.',
      },
    ],
  },
} as const

const languageOptions = [
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Deutsch', value: 'de' },
] as const

const activeDoc = computed(() => docsByLanguage[activeLanguage.value])

const localizedSeo = computed(() => ({
  fr: {
    title: 'CRM World | Documentation complète, synchronisation GitHub et bonnes pratiques',
    description:
      'Découvrez la documentation CRM complète: gestion des projets, tâches, sprints, Kanaban, demandes de tâches, gouvernance admin, et synchronisation GitHub en temps réel.',
    ogDescription:
      'Explorez les fonctionnalités CRM: pipeline projet, Kanaban opérationnel, workflow équipe, synchronisation GitHub bidirectionnelle et pilotage par reporting.',
  },
  en: {
    title: 'CRM World | Full documentation, GitHub sync, and best practices',
    description:
      'Explore complete CRM docs: projects, tasks, sprints, Kanaban, task requests, admin governance, and real-time GitHub synchronization.',
    ogDescription:
      'Discover CRM features: project pipeline, operational Kanaban, team workflows, bidirectional GitHub sync, and reporting-driven execution.',
  },
  es: {
    title: 'CRM World | Documentación completa, sincronización con GitHub y buenas prácticas',
    description:
      'Descubre la documentación completa del CRM: proyectos, tareas, sprints, Kanaban, solicitudes de tareas, gobierno admin y sincronización en tiempo real con GitHub.',
    ogDescription:
      'Explora funcionalidades CRM: pipeline de proyectos, Kanaban operativo, flujo de equipo, sincronización bidireccional con GitHub y seguimiento por reportes.',
  },
  de: {
    title: 'CRM World | Vollständige Doku, GitHub-Synchronisierung und Best Practices',
    description:
      'Entdecke die vollständige CRM-Dokumentation: Projekte, Aufgaben, Sprints, Kanaban, Aufgabenanfragen, Admin-Governance und GitHub-Synchronisierung in Echtzeit.',
    ogDescription:
      'Erkunde CRM-Funktionen: Projekt-Pipeline, operatives Kanaban, Team-Workflows, bidirektionale GitHub-Synchronisierung und reportingbasiertes Steuern.',
  },
}[activeLanguage.value]))

useSeoMeta({
  title: () => localizedSeo.value.title,
  description: () => localizedSeo.value.description,
  ogTitle: () => localizedSeo.value.title,
  ogDescription: () => localizedSeo.value.ogDescription,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.actions.createLead')"
      action-icon="mdi-account-plus-outline"
    >
      <template #right />
    </WorldModuleDrawers>

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
                  {{ activeDoc.heroSubtitle }}
                </p>
              </div>
            </div>

            <p class="text-body-1 mb-3">{{ activeDoc.heroBodyA }}</p>
            <p class="text-body-1 mb-0">
              {{ activeDoc.heroBodyBPrefix }}
              <NuxtLink to="/world/crm/kanaban" class="text-primary font-weight-medium text-decoration-none">Kanaban</NuxtLink>.
            </p>
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <v-card rounded="xl" class="pa-5 h-100 floating-card">
            <h2 class="text-h6 font-weight-bold mb-3">{{ activeDoc.documentationVariablesTitle }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ activeDoc.documentationVariablesText }}
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
              {{ activeDoc.documentationExample }}
            </v-alert>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-card rounded="xl" class="pa-5 h-100 floating-card">
            <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-3">
              <h2 class="text-h6 font-weight-bold mb-0">{{ activeDoc.docs4Title }}</h2>
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

            <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ activeDoc.documentationTitle }}</h3>
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
            <h2 class="text-h6 font-weight-bold mb-3">{{ activeDoc.recommendedReferences }}</h2>
            <v-list density="comfortable" class="bg-transparent">
              <v-list-item
                v-for="(reference, index) in activeDoc.references"
                :key="reference.title"
                :prepend-icon="['mdi-file-document-outline', 'mdi-api', 'mdi-github', 'mdi-school-outline'][index]"
                :title="reference.title"
              >
                <template #subtitle>{{ reference.subtitle }}</template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
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
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.language-toggle :deep(.v-btn) {
  text-transform: none;
}
</style>
