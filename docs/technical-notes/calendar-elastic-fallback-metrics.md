# Note technique — métrique de fallback Elasticsearch (Calendar)

## Contexte

Le service `EventListService` bascule sur les filtres repository SQL quand la recherche Elasticsearch n'est pas exploitable.

## Métrique exposée

- **Nom**: `calendar.elastic_fallback.count`
- **Type**: compteur (counter), incrémenté de `1` par fallback

## Tags / labels

- **`reason`** (obligatoire)
  - `exception`: une exception est levée pendant l'appel Elasticsearch
  - `too_many_hits`: Elasticsearch retourne plus de `1000` résultats, ce qui déclenche la stratégie de fallback SQL

## Comportement

La métrique est incrémentée à chaque fallback, avant de poursuivre avec les filtres repository.
