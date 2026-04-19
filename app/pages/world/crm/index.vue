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
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="pa-6 postcard-gradient-card">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="primary" variant="tonal" size="44">
              <v-icon icon="mdi-account-group-outline" />
            </v-avatar>
            <div>
              <h1 class="text-h5 font-weight-bold mb-1">{{ t('world.crm.label') }}</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Documentation complète du module CRM, de l'organisation du delivery à la synchronisation GitHub.
              </p>
            </div>
          </div>

          <p class="text-body-1 mb-3">
            Le CRM World centralise la gestion opérationnelle des équipes: suivi des projets, pilotage des sprints,
            orchestration des tâches, demandes de sous-tâches et supervision admin. L'objectif est de transformer un
            flux de travail dispersé en un système unifié, traçable et orienté delivery.
          </p>
          <p class="text-body-1 mb-0">
            Cette page sert de référence produit. Pour la vue de travail quotidienne en tableau, rendez-vous sur la page
            <NuxtLink to="/world/crm/kanaban" class="text-primary font-weight-medium text-decoration-none">Kanaban</NuxtLink>.
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" class="pa-5 h-100">
          <h2 class="text-h6 font-weight-bold mb-3">Fonctionnalités principales</h2>
          <v-list density="comfortable" class="bg-transparent">
            <v-list-item prepend-icon="mdi-folder-outline" title="Projects">
              <template #subtitle>Structuration des initiatives par périmètre, statut, code interne et description métier.</template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-format-list-checks" title="Tasks">
              <template #subtitle>Gestion du backlog avec priorités, échéances, pièces jointes et attribution collaborateur.</template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-run-fast" title="Sprints">
              <template #subtitle>Cadence agile avec objectif, fenêtre temporelle, état d'avancement et capacité d'équipe.</template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-view-kanban" title="Kanaban">
              <template #subtitle>Visualisation en colonnes des statuts, déplacement rapide et lecture instantanée de la charge.</template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-source-pull" title="Task requests">
              <template #subtitle>Canal de demandes opérationnelles pour convertir un besoin business en action technique traçable.</template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" class="pa-5 h-100">
          <h2 class="text-h6 font-weight-bold mb-3">Synchronisation GitHub (workflow recommandé)</h2>
          <ol class="pl-5 text-body-2">
            <li class="mb-2"><strong>Contexte projet:</strong> un projet CRM est associé à un repository (ou plusieurs) pour garder un mapping clair entre produit et code.</li>
            <li class="mb-2"><strong>Création des demandes:</strong> les task requests deviennent le point d'entrée entre le besoin fonctionnel et l'exécution technique.</li>
            <li class="mb-2"><strong>Sync descendante:</strong> le CRM récupère les métadonnées utiles (issues, PR, branches, statuts) selon les endpoints configurés.</li>
            <li class="mb-2"><strong>Sync montante:</strong> les statuts CRM peuvent être alignés sur l'état réel GitHub pour éviter les doubles saisies.</li>
            <li class="mb-2"><strong>Traçabilité:</strong> chaque changement reste historisé côté CRM, ce qui facilite l'audit, le reporting et la gouvernance delivery.</li>
            <li><strong>Qualité opérationnelle:</strong> la synchronisation limite les écarts de communication entre produit, QA et engineering.</li>
          </ol>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card rounded="xl" class="pa-5">
          <h2 class="text-h6 font-weight-bold mb-3">Documentation longue: architecture du module CRM</h2>
          <p class="text-body-2 mb-3">
            Le module est organisé pour couvrir le cycle complet: qualification, planification, exécution, contrôle et restitution.
            Les <strong>projects</strong> définissent le contexte, les <strong>tasks</strong> matérialisent les livrables,
            les <strong>sprints</strong> donnent le rythme, et les <strong>task requests</strong> capturent les besoins entrants.
            Le <strong>Kanaban</strong> offre la lecture visuelle en temps réel, utile pour les daily, le pilotage manager et l'anticipation
            des risques de blocage.
          </p>
          <p class="text-body-2 mb-3">
            Côté gouvernance, l'espace admin permet de sécuriser les opérations sensibles: règles d'accès, maintenance de données,
            contrôle des endpoints et actions de support. Cette séparation entre espace opérationnel et espace administrateur
            améliore la robustesse du système et réduit les erreurs en production.
          </p>
          <p class="text-body-2 mb-0">
            En pratique, la valeur du CRM vient de la cohérence entre référentiel fonctionnel et exécution technique.
            Avec la synchronisation GitHub, l'équipe dispose d'une source de vérité partagée: ce qui est demandé,
            ce qui est en cours, ce qui est livré, et ce qui est réellement fusionné dans le code.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
