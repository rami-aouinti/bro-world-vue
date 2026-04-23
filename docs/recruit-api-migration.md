# Recruit API migration (legacy -> new backend routes)

## 1) Classement des proxies par ancien pattern

### Pattern A — `/api/v1/recruit/general/*`

- `server/api/recruit/general/applicants/index.get.ts`
- `server/api/recruit/general/applicants/index.post.ts`
- `server/api/recruit/general/applications/index.post.ts`
- `server/api/recruit/general/resumes.post.ts`
- `server/api/recruit/general/private/job-applications/index.get.ts`
- `server/api/recruit/general/private/applications/[applicationId]/status.patch.ts`
- `server/api/recruit/general/private/me/jobs.get.ts`
- `server/api/recruit/general/private/me/resumes.get.ts`
- `server/api/recruit/general/private/me/resumes/[resumeId].patch.ts`

### Pattern B — `/api/v1/recruit/applications/{applicationSlug}/*`

- `server/api/recruit/applications/[applicationSlug]/applicants.post.ts`
- `server/api/recruit/applications/[applicationSlug]/applications.post.ts`
- `server/api/recruit/applications/[applicationSlug]/resumes.post.ts`
- `server/api/recruit/applications/[applicationSlug]/jobs.post.ts`
- `server/api/recruit/applications/[applicationSlug]/jobs/[jobId].patch.ts`
- `server/api/recruit/applications/[applicationSlug]/jobs/[jobId].delete.ts`
- `server/api/recruit/applications/[applicationSlug]/private/jobs/index.get.ts`
- `server/api/recruit/applications/[applicationSlug]/private/jobs/stats.get.ts`
- `server/api/recruit/applications/[applicationSlug]/private/jobs/[jobId].patch.ts`
- `server/api/recruit/applications/[applicationSlug]/private/job-applications.get.ts`
- `server/api/recruit/applications/[applicationSlug]/private/analytics.get.ts`
- `server/api/recruit/applications/[applicationSlug]/private/applications/[applicationId]/status-history.get.ts`
- `server/api/recruit/applications/[applicationSlug]/private/applications/[applicationId]/offers.post.ts`
- `server/api/recruit/applications/[applicationSlug]/private/offers/[offerId]/accept.post.ts`
- `server/api/recruit/applications/[applicationSlug]/private/offers/[offerId]/decline.post.ts`
- `server/api/recruit/applications/[applicationSlug]/private/offers/[offerId]/send.post.ts`
- `server/api/recruit/applications/[applicationSlug]/private/offers/[offerId]/withdraw.post.ts`
- `server/api/recruit/applications/[applicationSlug]/private/me/jobs.get.ts`
- `server/api/recruit/applications/[applicationSlug]/private/me/resumes/index.get.ts`
- `server/api/recruit/applications/[applicationSlug]/private/me/resumes/[resumeId].patch.ts`
- `server/api/recruit/applications/[applicationSlug]/private/me/resumes/[resumeId].delete.ts`

### Pattern C — `/api/v1/recruit/private/{applicationSlug}/pipeline`

- `server/api/recruit/private/[applicationSlug]/pipeline.get.ts`

## 2) Nouvelle cible backend utilisée

Le mapping appliqué est :

- `/api/v1/recruit/general/<resource>` -> `/api/v1/recruit/<resource>`
- `/api/v1/recruit/applications/{applicationSlug}/<resource>` -> `/api/v1/recruit/<resource>`
- `/api/v1/recruit/private/{applicationSlug}/pipeline` -> `/api/v1/recruit/private/pipeline`

Ressources migrées via ce mapping :

- `applicants`
- `applications`
- `resumes`
- `jobs`
- `job-applications`
- `offers`
- `pipeline`
- `status`
- `status-history`
- `interviews`
- `feedback`
- `analytics`

## 3) Compat temporaire (anti-cassure front)

`callPrivateApi` tente d'abord la nouvelle route, puis fallback automatiquement vers l'ancienne route legacy en cas de `404` backend.

## 4) Plan de suppression des routes legacy

1. **Phase 1 (maintenant)** : mapping + fallback `404` actif.
2. **Phase 2 (après validation backend)** : monitoring des fallbacks legacy (compteur / logs).
3. **Phase 3 (J+14 min)** : suppression du fallback, conservation du mapping vers nouvelles routes.
4. **Phase 4 (J+30 min)** : nettoyage final des anciens chemins Nuxt hérités (`[applicationSlug]` purement legacy).
