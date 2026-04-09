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

## Règle d'évolution

Quand un nouvel endpoint mutation (`POST`, `PUT`, `PATCH`, `DELETE`) est ajouté:

1. Ajouter une règle dans `server/utils/mutationInvalidation.ts`.
2. Passer `mutationKey` dans le handler (`mutatingPrivateApiCall` ou `createProxyHandler`).
3. Mettre à jour ce tableau.
