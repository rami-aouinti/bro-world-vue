# Resume template guidelines

Ces règles sont obligatoires pour tout nouveau `ResumeTemplate*.vue`.

## 1) Base commune (design tokens + utilitaires)
- Toujours appliquer `cv-template-base` sur la racine du template.
- Utiliser les utilitaires partagés de `app/assets/styles/resume-template-utils.css` dès que possible :
  - `cv-heading-section`
  - `cv-divider-top` / `cv-divider-bottom`
  - `cv-card-surface`
  - `cv-sidebar-surface`
- La migration des templates legacy doit rester progressive : garder le layout/rythme visuel, mais remplacer les styles structurels dupliqués par ces utilitaires quand c'est possible.

## 2) Couleurs / palette
- Palette obligatoire via variables CSS `--cv-*`.
- Interdit de hardcoder des couleurs de marque (hex, rgb, hsl) dans les templates.
- Les neutres fonctionnels (ex. lisibilité metadata) doivent rester basés sur `color-mix(... var(--cv-*) ...)`.

## 3) Gradients
- Centraliser les gradients via utilitaires de `resume-template-utils.css`.
- Préférer :
  - `cv-gradient-page`
  - `cv-gradient-hero`
  - `cv-gradient-sidebar`
  - `cv-gradient-split-left` / `cv-gradient-split-right`
  - `cv-gradient-aurora`
- Pour un nouveau gradient thématique, ajouter une utilité basée sur `--cv-*` plutôt que de coder le gradient directement dans un template.

## 4) Identité visuelle
- L'identité d'un template vient du layout, des espacements, de la densité de contenu, des bordures et de la typographie.
- Ne pas dépendre de couleurs fixes pour distinguer un template.
