# Cache invalidation matrix for API mutations

Chaque mutation serveur doit déclarer une `mutationKey` qui référence une règle dans `server/utils/mutationInvalidation.ts`.

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
| `users:block:create`                 | private | `users`                  |
| `users:block:delete`                 | private | `users`                  |
| `users:friends:action`               | private | `users`, `notifications` |

## Sports / Football — politique de cache

Même si les endpoints football sont majoritairement en `GET`, ils nécessitent une stratégie explicite pour équilibrer fraîcheur des données et charge API.

### TTL recommandé par endpoint

| Endpoint          | Exemple de clé logique                          | TTL recommandé                     | Notes                                                                   |
| ----------------- | ----------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| `leagues`         | `football:leagues`                              | 24h                                | Données très stables (identifiants, noms, pays).                        |
| `teams`           | `football:teams:<leagueId>:<season>`            | 6h                                 | Effectifs et métadonnées changent peu à l’échelle de la journée.        |
| `fixtures`        | `football:fixtures:<leagueId>:<season>:<date?>` | 60s (live), 15 min (hors live)     | Basculer dynamiquement en TTL court quand un match est en cours.        |
| `fixture details` | `football:fixture:<fixtureId>`                  | 30s (live), 12h (terminé)          | Événements de match sensibles au temps réel (score, cartons, stats).    |
| `standings`       | `football:standings:<leagueId>:<season>`        | 10 min (jour de match), 6h (sinon) | Rafraîchir plus souvent quand des rencontres influencent le classement. |

### Stratégie de purge / invalidation (refresh live)

- **Approche par état de match**: basculer en mode “live refresh” dès qu’un `fixture` est `1H`, `2H`, `HT`, `ET`, `P`, `LIVE` (ou statut équivalent du provider).
- **Invalidation ciblée pendant le live**:
  - invalider `football:fixture:<fixtureId>` à chaque cycle de polling (30-60s),
  - invalider les listes `football:fixtures:<leagueId>:<season>:*` qui contiennent ce match,
  - invalider `football:standings:<leagueId>:<season>` sur but, carton rouge ou fin de match.
- **Sortie de live**: au passage `FT`/`AET`/`PEN`, faire une purge immédiate puis appliquer le TTL “post-match” (plus long).
- **Fallback sans événement push**: si aucun webhook/stream n’existe, utiliser un polling adaptatif (30-60s live, 5-15 min hors live).
- **Soft refresh recommandé**: servir le cache courant puis déclencher une revalidation asynchrone (stale-while-revalidate) pour limiter la latence perçue.

### Convention de clés de cache

Format recommandé (normalisé et prévisible):

`football:<resource>:<scope...>`

Exemples:

- `football:leagues`
- `football:teams:<leagueId>:<season>`
- `football:fixtures:<leagueId>:<season>:<date>`
- `football:fixture:<fixtureId>`
- `football:standings:<leagueId>:<season>`
- `football:team:<teamId>:fixtures:<season>`

Règles de construction:

1. Utiliser des IDs stables du provider (`leagueId`, `teamId`, `fixtureId`).
2. Toujours inclure `season` pour éviter les collisions inter-saisons.
3. Normaliser les dates en `YYYY-MM-DD` si présentes.
4. Éviter les clés ambiguës (ex: `football:fixtures:today` sans timezone/context).

## Règle d'évolution

Quand un nouvel endpoint mutation (`POST`, `PUT`, `PATCH`, `DELETE`) est ajouté:

1. Ajouter une règle dans `server/utils/mutationInvalidation.ts`.
2. Passer `mutationKey` dans le handler (`mutatingPrivateApiCall` ou `createProxyHandler`).
3. Mettre à jour ce tableau.
