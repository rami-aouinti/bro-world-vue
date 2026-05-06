# Checklist conformité templates CV

Cette checklist couvre les templates CV visibles dans le sélecteur de `app/pages/resume/cv/preview.vue`.

## QA design (refactors)

Checklist manuelle + garde-fou composant à exécuter à chaque refactor design:

- `DESIGN_REFACTOR_QA_CHECKLIST.md`

## Critères de conformité

- ✅ Réagit au changement de `selectedTheme` via variables CSS `--cv-sidebar`, `--cv-accent`, `--cv-page` (+ variables de contraste).
- ✅ Réagit à `selectedRounded` via `--cv-radius`.
- ✅ Réagit à `selectedTextStyle` via `--cv-font-family`, `--cv-font-style`, `--cv-font-weight`.
- ✅ Pipeline de rendu unique respecté: `state -> ResumeRenderer -> SectionRenderer -> ResumeSection*` (pas de split `template/shared` legacy).

## Mapping par template (zones stylables)

| Variant          | Fichier                           | Zones stylables                                               | Theme | Rounded | Text style | Pipeline section unique | Statut          |
| ---------------- | --------------------------------- | ------------------------------------------------------------- | ----- | ------- | ---------- | ----------------------- | --------------- |
| `classic`        | `ResumeTemplateClassic.vue`       | conteneur principal, sidebar, titres, barres de niveau        | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `modern`         | `ResumeTemplateModern.vue`        | entête, grille, sidebar, sections, barres compétences/langues | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `professional`   | `ResumeTemplateProfessional.vue`  | grille principale, sidebar, contenu principal, titres         | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `traditional`    | `ResumeTemplateTraditional.vue`   | conteneur, blocs de sections, séparateurs et textes           | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `creative`       | `ResumeTemplateCreative.vue`      | hero, quick-info, cards, timeline/chips                       | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `minimalist`     | `ResumeTemplateMinimalist.vue`    | page principale, sections, split layout                       | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `executive`      | `ResumeTemplateExecutive.vue`     | grille, sidebar, timeline, blocs skills                       | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `aurora`         | `ResumeTemplateAurora.vue`        | fond, panneaux, métriques, contraste texte                    | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `terra`          | `ResumeTemplateTerra.vue`         | grille terra, aside, photo, sections expérience/formation     | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `ocean-split`    | `ResumeTemplateOceanSplit.vue`    | split gauche/droite, photo, lignes de skill                   | ✅    | ✅      | ✅         | ✅                      | Support complet |
| `corporate-blue` | `ResumeTemplateCorporateBlue.vue` | header, body/aside, blocs article, dot rows                   | ✅    | ✅      | ✅         | ✅                      | Support complet |

## Règle de cohérence registry/sections (obligatoire)

À chaque ajout/modification de template ou de section CV, exécuter et maintenir le test:

- `test/nuxt/resume-section-registry-consistency.test.ts`

Ce test impose:

- `defaultVariant` doit toujours exister dans `variants` pour chaque entrée de `RESUME_SECTION_REGISTRY`.
- Les variantes déclarées doivent être réellement supportées par les composants de section ciblés (au minimum `language`, `project`, `experience`).
- Les actions de toolbar configurées (`change-variant`, `move-up`, `move-down`, `add-item`, `delete-section`) doivent rester cohérentes avec les `props`, les bindings `SectionToolbar` et les `emit` exposés.

Objectif: empêcher les régressions silencieuses quand on introduit une nouvelle variante/template/section.

## Patterns de layout CV (A/B/C par structure)

> Source runtime: `app/constants/resumeLayouts.ts`.

| ID              | Objectif              | Ordre sections                                                                                 | Zones             |
| --------------- | --------------------- | ---------------------------------------------------------------------------------------------- | ----------------- |
| `no-aside-a`    | A = focus expérience  | `contact → experience → education → project → skill → language`                                | `main` uniquement |
| `no-aside-b`    | B = focus compétences | `contact → skill → language → certification → experience → project`                            | `main` uniquement |
| `no-aside-c`    | C = focus mixte/ATS   | `contact → experience → skill → project → education → language`                                | `main` uniquement |
| `aside-left-a`  | A = focus expérience  | `main: contact → experience → education → project` / `aside: skill → language`                 | `aside` à gauche  |
| `aside-left-b`  | B = focus compétences | `main: contact → experience → project → education` / `aside: skill → language → certification` | `aside` à gauche  |
| `aside-left-c`  | C = focus mixte/ATS   | `main: contact → experience → project → education` / `aside: skill → language → reference`     | `aside` à gauche  |
| `aside-right-a` | A = focus expérience  | `main: contact → experience → education → project` / `aside: skill → language`                 | `aside` à droite  |
| `aside-right-b` | B = focus compétences | `main: contact → experience → project → education` / `aside: skill → language → certification` | `aside` à droite  |
| `aside-right-c` | C = focus mixte/ATS   | `main: contact → experience → project → education` / `aside: skill → language → reference`     | `aside` à droite  |

Règles globales:

- Mapping explicite des sections clés `contact`, `education`, `experience`, `skill`, `project`, `language` via `sectionMapping`.
- Fallback par section absente via `fallbackRules` (ex: `reference`, `certification`, `hobby` sont ignorées proprement si vides, sinon injectées selon la zone autorisée).
- Contrainte de lisibilité/print: chaque layout déclare `maxPageTarget: 1` et `pdfOverflowGuard: 'strict'` pour limiter les overflows majeurs en export PDF.
