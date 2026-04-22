# Cache invalidation matrix for API mutations

Chaque mutation serveur doit déclarer une `mutationKey` qui référence une règle dans `server/utils/mutationInvalidation.ts`.

## Politique unifiée World (CRM / Shop / Learning / Jobs)

Les stores Pinia `worldCrm`, `worldShop`, `worldLearning`, `worldJobs` appliquent désormais la même stratégie:

- **TTL par module**:
  - `crm`: 3 minutes
  - `shop`: 5 minutes
  - `learning`: 4 minutes
  - `jobs`: 2 minutes
- **Refresh forcé**: toutes les actions `fetch*` acceptent `force: true` pour ignorer le cache.
- **Invalidation ciblée**:
  - `invalidateCache(prefix?)` purge tout ou une famille de clés.
  - Les mutations métier (`transition`, `policy update`, `create/update`) invalident les préfixes concernés.
- **Clés stables**: format `module-resource:param=value:param=value` avec tri alphabétique des filtres.
  - Exemple: `shop-products:page=1:limit=20:q=hoodie:status=active`

## Section Sports / Football

### TTL recommandé par endpoint

Ces TTL sont des valeurs de base pour limiter les appels API tout en gardant une expérience "live" cohérente.

| Endpoint            | TTL recommandé | Notes |
| ------------------- | -------------- | ----- |
| `leagues`           | 24h            | Donnée très stable (compétitions). |
| `teams`             | 12h            | Effectifs / métadonnées peu volatiles hors mercato. |
| `fixtures`          | 60s à 120s     | Liste de matchs à rafraîchir fréquemment en phase live. |
| `fixture details`   | 15s à 30s      | Événements de match (score, stats, incidents) quasi temps réel. |
| `standings`         | 5min           | Classements à recalculer après fin de match et événements majeurs. |

> Recommandation pratique: utiliser la borne basse du TTL pendant les créneaux live, et la borne haute hors match.

### Stratégie de purge / invalidation (GET + refresh live)

Même avec une API majoritairement en `GET`, on applique une invalidation orientée événements:

1. **Refresh périodique intelligent**
   - Polling court (`15-30s`) pour `fixture details` quand un match est `LIVE`.
   - Polling moyen (`60-120s`) pour `fixtures` et `standings` le jour de match.
   - Retour au TTL nominal hors période active.
2. **Invalidation en cascade sur changement d'état**
   - Passage `NS` → `LIVE`: invalider `fixtures`, `fixture details:<fixtureId>`.
   - But / carton rouge / mi-temps / fin de match: invalider `fixture details:<fixtureId>`, puis `fixtures` et `standings` de la ligue concernée.
   - Passage `LIVE` → `FT`: invalider immédiatement `fixture details`, `fixtures`, `standings` (priorité au classement).
3. **Stale-while-revalidate**
   - Servir la dernière valeur cache si TTL expiré depuis peu (grâce période de tolérance), puis relancer un refresh en arrière-plan.
   - Limiter les pics de charge lors des multiplex.
4. **Déduplication des refresh**
   - Une seule requête active par clé de cache.
   - Les consommateurs concurrents se branchent sur la même promesse/réponse.

### Convention de clés de cache (league / season / fixture / team)

Format recommandé:

`sports:football:<resource>:league=<leagueId>:season=<season>:fixture=<fixtureId>:team=<teamId>`

Règles:

- Garder un **ordre stable** des dimensions: `league` → `season` → `fixture` → `team`.
- Omettre les dimensions non pertinentes pour une ressource (ex: `leagues` n'inclut pas `fixture`).
- Préférer les IDs normalisés (numériques ou slug canonicalisé).
- Ajouter les filtres secondaires en suffixe trié alphabétiquement.

Exemples:

- `sports:football:leagues:season=2026`
- `sports:football:teams:league=39:season=2026`
- `sports:football:fixtures:league=39:season=2026:date=2026-04-16`
- `sports:football:fixture-details:fixture=123456`
- `sports:football:standings:league=39:season=2026`

## Règles de purge par scope

- `public` → purge tous les caches qui matchent `api:public:<resource>:*`
- `private` → purge tous les caches qui matchent `api:private:<username>:<resource>:*`

## Mutation → prefixes à invalider

| Mutation key                         | Scope   | Prefixes invalidés       |
| ------------------------------------ | ------- | ------------------------ |
| `stories:create`                     | private | `stories`                |
| `stories:delete`                     | private | `stories`                |
| `blog:posts:create`                  | private | `blog`                   |
| `blog:posts:update`                  | private | `blog`                   |
| `blog:posts:delete`                  | private | `blog`                   |
| `blog:posts:comments:create`         | private | `blog`                   |
| `blog:posts:comments:update`         | private | `blog`                   |
| `blog:posts:comments:delete`         | private | `blog`                   |
| `blog:posts:reactions:create`        | private | `blog`                   |
| `blog:posts:reactions:update`        | private | `blog`                   |
| `blog:posts:reactions:delete`        | private | `blog`                   |
| `blog:comments:reactions:create`     | private | `blog`                   |
| `blog:comments:reactions:update`     | private | `blog`                   |
| `blog:comments:reactions:delete`     | private | `blog`                   |
| `chat:conversations:update`          | private | `chat`                   |
| `chat:conversations:create`          | private | `chat`                   |
| `chat:conversations:delete`          | private | `chat`                   |
| `chat:conversations:messages:create` | private | `chat`                   |
| `chat:conversations:messages:read`   | private | `chat`, `notifications`  |
| `chat:messages:update`               | private | `chat`                   |
| `chat:messages:delete`               | private | `chat`                   |
| `chat:messages:reactions:create`     | private | `chat`                   |
| `chat:reactions:update`              | private | `chat`                   |
| `chat:reactions:delete`              | private | `chat`                   |
| `calendar:events:create`             | private | `calendar`               |
| `calendar:events:update`             | private | `calendar`               |
| `calendar:events:cancel`             | private | `calendar`               |
| `calendar:events:delete`             | private | `calendar`               |
| `notifications:read-all`             | private | `notifications`          |
| `quiz:submit`                        | public  | `quiz`                   |
| `crm:general:mutate`                 | private | `crm`                    |
| `crm:applications:github:mutate`     | private | `crm`                    |
| `users:block:create`                 | private | `users`                  |
| `users:block:delete`                 | private | `users`                  |
| `users:friends:action`               | private | `users`, `notifications` |

## Règle d'évolution

Quand un nouvel endpoint mutation (`POST`, `PUT`, `PATCH`, `DELETE`) est ajouté:

1. Ajouter une règle dans `server/utils/mutationInvalidation.ts`.
2. Passer `mutationKey` dans le handler (`mutatingPrivateApiCall` ou `createProxyHandler`).
3. Mettre à jour ce tableau.

## Module CRM GitHub (projects + applications)

### TTL GET côté serveur (`server/utils/crmGithubGeneralApi.ts`)

| Endpoint (pattern) | TTL |
| --- | --- |
| `projects/:project/github/commits` | 60s |
| `projects/:project/github/branches` | 60s |
| `projects/:project/github/pull-requests` | 60s |
| `projects/:project/github/collaborators` | 60s |
| `projects/:project/github/actions/workflows` | 180s |
| `projects/:project/github/actions/runs` | 45s |
| autres endpoints CRM GitHub | TTL CRM par défaut (`resolveCacheTtl('crm')`) |

### Invalidation mutation par préfixe (éviter stale data)

- `mutateCrmGithubGeneral` conserve l'invalidation globale `crm:general:mutate` et ajoute une invalidation **ciblée** des préfixes:
  - `crm/general/projects/:project/github/<first-resource-segment>`
  - `crm/general/projects/:project/github/dashboard`
  - et, pour `actions/*`, `actions/workflows` + `actions/runs`
- `mutateCrmGithubApplications` applique la même logique pour:
  - `crm/applications/:applicationSlug/projects/:project/github/<first-resource-segment>`
  - `crm/applications/:applicationSlug/projects/:project/github/dashboard`
- L'invalidation est exécutée sur cache `private` (scope user) et `public` pour ces préfixes.

### Store `app/stores/worldCrmGithub.ts`

- Clés harmonisées en format stable:
  - `github:project=<id>:resource=<resource>:<filters triés>`
  - `github:app=<slug>:project=<id>:resource=<resource>:<filters triés>`
- `forceRefresh(prefix?)` est exposé et repose sur l'invalidation locale des entrées store.
- `preloadRepositoryCriticalDatasets(projectId, repository, applicationSlug?)` charge en parallèle une seule fois:
  - collaborators, branches, commits, pull-requests, workflows
  - puis les sous-pages réutilisent ces datasets via le cache store.
