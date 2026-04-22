# Conventions modules World

Ce document sert de base commune pour les modules CRM, Jobs, Learning et Shop.

## 1) Structure `types/` et `stores/`

- **Types**: centraliser les contrats de payload/réponse dans `types/world/<module>.ts`.
- **Store Pinia**: un store par module (`app/stores/world<Module>.ts`) avec la même base:
  - `items`, `detail`, `pending`, `error`, `filters`, `pagination`, `lastFetchedAt`.
  - Fonctions explicites `fetch*`, `mutate*`, `invalidateCache`.
- **Éviter la logique métier dans les pages**: les pages pilotent l’UI, la normalisation données est dans les stores/types.

## 2) Règles i18n

- **Clés stables** et hiérarchiques: `world.<module>.<zone>.<key>`.
- Toujours fournir un fallback lisible côté `t(key, fallback)` sur les pages critiques.
- Les messages d’erreur API transitent par des clés dédiées (ex: `world.shop.errors.productsFetch`).
- Ne pas embarquer de texte métier dur dans les composants quand une clé existe déjà.

## 3) Stratégie cache

- Cache mémoire store avec TTL par module.
- Clés de cache déterministes basées sur filtres/pagination (tri des clés + encodage).
- Toute mutation (`POST/PATCH/DELETE`) **doit** invalider les entrées liées via préfixe.
- Exposer `force: true` sur les fetchs critiques pour ignorer le cache.
- Instrumenter les **cache hit/miss** pour suivre la qualité du cache.

## 4) Pattern pagination / filtres

- Pagination normalisée: `page`, `limit`, `total`, `totalPages`.
- Filtres normalisés avant requête (supprimer valeurs vides, typer correctement).
- Les changements filtres remettent la page à `1`.
- Les changements `page/limit` relancent uniquement le fetch list.
- L’état vide (`empty`) est affiché uniquement si pas de loading et pas d’erreur.

## 5) Télémétrie minimale requise

- Pour chaque fetch store, mesurer:
  - durée cumulée des fetchs,
  - nombre de fetchs,
  - erreurs API,
  - hit/miss cache.
- Utiliser `app/utils/storeTelemetry.ts` pour homogénéiser les compteurs.
- Réviser ces métriques en revue de perf avant livraison de nouveaux modules.

## 6) Convention de routing pages CRM

Dans `app/pages/world/crm/`, appliquer une convention unique pour éviter les divergences:

- **Page liste**: fichier direct à la racine CRM.
  - Exemple: `app/pages/world/crm/projects.vue`
- **Page détail dynamique**: dossier dynamique + `index.vue`.
  - Exemple: `app/pages/world/crm/projects/[project]/index.vue`

Cette règle s’applique à toutes les ressources CRM (projects, tasks, sprints, contacts, etc.).

### Note de migration

- Si un ancien écran détail existe en fichier dynamique plat (ex: `projects/[project].vue`), le migrer vers `projects/[project]/index.vue`.
- **Ne plus créer** de nouveaux fichiers dynamiques plats dans `app/pages/world/crm/`.
- Lors de chaque ajout de ressource CRM:
  1. créer la liste en `<resource>.vue`;
  2. créer le détail en `<resource>/[param]/index.vue`.

## 7) Migration Drawers de page

### Note de migration

- Le composant legacy `app/components/PageDrawers.vue` est supprimé.
- Utiliser **uniquement** `AppPageDrawers` (source: `app/components/App/PageDrawers.vue`) dans les layouts/pages/composants.
- Pour les layouts clés (`app/layouts/*.vue`), les usages compatibles sont:
  - passage d’un composant via `:left-component` / `:right-component`;
  - slots nommés `#left` / `#right`.
- Ne pas réintroduire `<PageDrawers>` dans les templates.
