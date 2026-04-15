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
