# Checklist QA manuelle — régression preview renderer

À exécuter **à chaque refactor du renderer** (`ResumeRenderer.vue`, sections, skins, toolbar).

## Portée
- Preview principale visible dès le chargement.
- Changement de template (`classic`, `terra`, `ocean-split`, etc.) sans écran vide.
- Présence du `header` + au moins **1 section `main`** + au moins **1 section `aside`**.
- Toolbar de section visible au survol des sections clés.

## Pré-requis
1. Lancer l’app locale:
   - `pnpm dev`
2. Ouvrir l’éditeur CV:
   - `http://localhost:3000/resume/create`
3. Vérifier qu’un CV d’exemple est chargé.

## Checklist d’exécution

### 1) Preview principale visible au chargement
- [ ] La zone preview s’affiche immédiatement (pas d’écran blanc).
- [ ] Le nom/prénom et le rôle sont visibles dans l’en-tête.
- [ ] Aucun message d’erreur bloquant dans la console navigateur.

### 2) Switch template sans écran vide
- [ ] Depuis le sélecteur de templates, passer successivement sur:
  - [ ] `classic`
  - [ ] `terra`
  - [ ] `ocean-split`
- [ ] Entre chaque changement, la preview reste visible (pas de flash blanc durable, pas de zone vide).
- [ ] Revenir au template initial et confirmer que le rendu reste cohérent.

### 3) Structure minimale du rendu
Pour chaque template vérifié:
- [ ] Un `header` est présent.
- [ ] Au moins une section est visible dans la colonne `main` (ex: `Experience`).
- [ ] Au moins une section est visible dans la colonne `aside` (ex: `Languages` / `Skills`).

### 4) Toolbar au hover sur sections clés
Tester au moins ces sections: `Experience`, `Education`, `Language`.
- [ ] Au survol d’une section clé, la toolbar devient visible.
- [ ] Les actions principales sont présentes (ajout, variante, déplacement).
- [ ] Le focus clavier (`Tab`) fait aussi apparaître la toolbar (accessibilité de base).

## Traçabilité recommandée
- En cas d’échec, capturer:
  - template concerné,
  - section concernée,
  - screenshot,
  - étape exacte de reproduction.

## Exécution CI / locale (complément auto)
Un test composant couvre les invariants essentiels de cette checklist:
- `pnpm vitest test/nuxt/resume-renderer-preview-regression.test.ts`

Ce test **ne remplace pas** la vérification visuelle manuelle (hover réel, perception de “blank screen”).
