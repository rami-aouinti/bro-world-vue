# Guide rapide — nommage des clés i18n

Ce guide standardise les clés de traduction des composants Vue.

## 1) Namespace par ownership

- CRM : `crm.components.<componentName>.*`
- Quiz : `quiz.<feature>.*`
- World (hors CRM/Quiz) : `world.<module>.<feature>.*`

## 2) Convention de nommage

- Utiliser le `camelCase` pour les segments de clés.
- Le nom de composant est en `camelCase` sans suffixe `.vue`.
- Préférer des groupes stables :
  - `fields.*` (labels, hints, placeholders)
  - `actions.*` (boutons)
  - `status.*` (états)
  - `errors.*` (messages d’erreur)
  - `empty`, `title`, `subtitle` (textes structurels)

## 3) Exemples

- `crm.components.endpointAction.fields.queryJson`
- `crm.components.endpointAction.actions.execute`
- `quiz.leaderboard.title`
- `world.jobs.pipelineBoard.empty`

## 4) Règles d’implémentation

- Toujours initialiser `const { t } = useI18n()` dans les composants qui affichent du texte.
- Remplacer toute chaîne UI statique par `t('...')`.
- Prévoir les interpolations avec des paramètres nommés :
  - `t('...status.label', { status })`
  - `t('...fields.param', { param })`
- Ajouter systématiquement les nouvelles clés dans `en`, `fr`, `es`, `de`.

## 5) Checklist PR

- [ ] Aucun libellé UI statique résiduel dans le composant modifié.
- [ ] Clés ajoutées dans les 4 locales.
- [ ] Namespace cohérent avec l’ownership du composant.
- [ ] Interpolations nommées (pas de concaténation de chaînes traduites).
