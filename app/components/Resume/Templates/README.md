# Checklist conformité templates CV

Cette checklist couvre les templates CV visibles dans le sélecteur de `app/pages/resume/create.vue`.


## QA design (refactors)

Checklist manuelle + garde-fou composant à exécuter à chaque refactor design:

- `DESIGN_REFACTOR_QA_CHECKLIST.md`

## Critères de conformité

- ✅ Réagit au changement de `selectedTheme` via variables CSS `--cv-sidebar`, `--cv-accent`, `--cv-page` (+ variables de contraste).
- ✅ Réagit à `selectedRounded` via `--cv-radius`.
- ✅ Réagit à `selectedTextStyle` via `--cv-font-family`, `--cv-font-style`, `--cv-font-weight`.
- ✅ Pipeline de rendu unique respecté: `state -> ResumeRenderer -> SectionRenderer -> ResumeSection*` (pas de split `template/shared` legacy).

## Mapping par template (zones stylables)

| Variant | Fichier | Zones stylables | Theme | Rounded | Text style | Pipeline section unique | Statut |
|---|---|---|---|---|---|---|---|
| `classic` | `ResumeTemplateClassic.vue` | conteneur principal, sidebar, titres, barres de niveau | ✅ | ✅ | ✅ | ✅ | Support complet |
| `modern` | `ResumeTemplateModern.vue` | entête, grille, sidebar, sections, barres compétences/langues | ✅ | ✅ | ✅ | ✅ | Support complet |
| `professional` | `ResumeTemplateProfessional.vue` | grille principale, sidebar, contenu principal, titres | ✅ | ✅ | ✅ | ✅ | Support complet |
| `traditional` | `ResumeTemplateTraditional.vue` | conteneur, blocs de sections, séparateurs et textes | ✅ | ✅ | ✅ | ✅ | Support complet |
| `creative` | `ResumeTemplateCreative.vue` | hero, quick-info, cards, timeline/chips | ✅ | ✅ | ✅ | ✅ | Support complet |
| `minimalist` | `ResumeTemplateMinimalist.vue` | page principale, sections, split layout | ✅ | ✅ | ✅ | ✅ | Support complet |
| `executive` | `ResumeTemplateExecutive.vue` | grille, sidebar, timeline, blocs skills | ✅ | ✅ | ✅ | ✅ | Support complet |
| `aurora` | `ResumeTemplateAurora.vue` | fond, panneaux, métriques, contraste texte | ✅ | ✅ | ✅ | ✅ | Support complet |
| `terra` | `ResumeTemplateTerra.vue` | grille terra, aside, photo, sections expérience/formation | ✅ | ✅ | ✅ | ✅ | Support complet |
| `ocean-split` | `ResumeTemplateOceanSplit.vue` | split gauche/droite, photo, lignes de skill | ✅ | ✅ | ✅ | ✅ | Support complet |
| `corporate-blue` | `ResumeTemplateCorporateBlue.vue` | header, body/aside, blocs article, dot rows | ✅ | ✅ | ✅ | ✅ | Support complet |

## Règle de cohérence registry/sections (obligatoire)

À chaque ajout/modification de template ou de section CV, exécuter et maintenir le test:

- `test/nuxt/resume-section-registry-consistency.test.ts`

Ce test impose:

- `defaultVariant` doit toujours exister dans `variants` pour chaque entrée de `RESUME_SECTION_REGISTRY`.
- Les variantes déclarées doivent être réellement supportées par les composants de section ciblés (au minimum `language`, `project`, `experience`).
- Les actions de toolbar configurées (`change-variant`, `move-up`, `move-down`, `add-item`, `delete-section`) doivent rester cohérentes avec les `props`, les bindings `SectionToolbar` et les `emit` exposés.

Objectif: empêcher les régressions silencieuses quand on introduit une nouvelle variante/template/section.
