# Migration des templates CV vers `templateConfig`

## 1) Inventaire actuel + patterns communs

### Templates CV existants (legacy pages/components)

- ResumeTemplateClassic.vue
- ResumeTemplateModern.vue
- ResumeTemplateMinimalist.vue
- ResumeTemplateTraditional.vue
- ResumeTemplateCreative.vue
- ResumeTemplateProfessional.vue
- ResumeTemplateExecutive.vue
- ResumeTemplateCorporateBlue.vue
- ResumeTemplateAurora.vue
- ResumeTemplateTerra.vue
- ResumeTemplateOceanSplit.vue

### Patterns communs identifiés

- **Layout**
  - Schéma principal en `main` + `aside` avec variantes `no-aside`, `aside-left`, `aside-right`.
  - Ordonnancement par section (`experience`, `education`, `project`, etc.) et priorité.
- **Sections**
  - Sections récurrentes: `experience`, `education`, `project`, `skill`, `language`, `reference`, `certification`, `hobby`.
  - Variantes de rendu communes: `classic`, `timeline`, `cards`, `list`.
- **Style / Skin**
  - Skin centralisé (`skin-*`) via palette, typographie, radius, style d’icône.
  - Tokens thème partagés pour harmoniser couleur/espacement/composants.

---

## 2) 3 templates pilotes (nouveau moteur)

Pilotes implémentés avec mapping direct:

- `classic` -> `pilot-classic` (`skin-classic`, `layout-no-aside-a`)
- `fugo` -> `pilot-fugo` (`skin-terra`, `layout-aside-right-b`)
- `minimal` -> `pilot-minimal` (`skin-minimal-profile`, `layout-no-aside-c`)

Objectif: valider le pipeline `legacyId -> templateConfig -> ResumeRenderer`.

---

## 3) Mode compatibilité temporaire

- Nouveau paramètre `compatibilityTemplateId` dans `app/modules/resume/components/ResumeRenderer.vue`.
- Résolution via `resolveCompatibilityTemplateConfig`.
- Priorité:
  1. `templateConfig` explicite
  2. mapping compatibilité legacy

Cela permet de conserver l’existant pendant la migration progressive.

---

## 4) Migration par lots (10 templates)

### Batch 1 (10 templates)

- [ ] Classic
- [ ] Modern
- [ ] Minimalist
- [ ] Traditional
- [ ] Creative
- [ ] Professional
- [ ] Executive
- [ ] CorporateBlue
- [ ] Aurora
- [ ] Terra

### Checklist visuelle par section (à cocher pour chaque template)

- [ ] Header / identité (nom, titre, contact)
- [ ] Photo (position, ratio, fallback)
- [ ] Experience
- [ ] Education
- [ ] Projects
- [ ] Skills
- [ ] Languages
- [ ] Certifications
- [ ] References
- [ ] Hobbies
- [ ] Aside/main (distribution & ordre)
- [ ] Responsive (desktop/tablette/mobile)
- [ ] Impression/PDF

---

## 5) Suppression des anciens composants/pages

Suppression autorisée **uniquement** après confirmation de parité fonctionnelle:

- [ ] parité visuelle validée
- [ ] parité données/sections validée
- [ ] snapshots/tests mis à jour
- [ ] QA produit validée
- [ ] rollback plan documenté
