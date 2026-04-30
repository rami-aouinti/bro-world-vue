# Checklist QA design — Resume templates

Objectif: valider systématiquement (template par template) que les contrôles de design du renderer ont un impact visuel réel.

> À exécuter **à chaque refactor design** (tokens, classes CSS, layout, typographie, density/dividers, mapping de templates).

## Portée

Templates CV à vérifier:

- `classic`
- `modern`
- `professional`
- `traditional`
- `creative`
- `minimalist`
- `executive`
- `aurora`
- `terra`
- `ocean-split`
- `corporate-blue`

Composants de référence:

- Renderer: `ResumeRenderer.vue`
- Dispatcher de sections: `SectionRenderer.vue`
- Sections atomiques: `ResumeSection*.vue`
- Templates skin/layout: `ResumeTemplate*.vue`

Pipeline attendu (à préserver lors des refactors):

`state -> ResumeRenderer -> SectionRenderer -> ResumeSection*`

## Pré-requis

1. Lancer l'application: `npm run dev`.
2. Ouvrir `/resume/create`.
3. Charger un CV de test avec contenu dans toutes les sections (experience/education/projects/languages/skills/references/hobbies).
4. Ouvrir le sélecteur de template (pour passer template par template).

## Procédure manuelle (à faire pour **chaque template**)

Pour chaque template listé dans "Portée", exécuter les checks ci-dessous.

### 1) Palette

- Action: changer la palette (`selectedTheme`), au minimum entre 2 palettes fortement différentes.
- Vérifier:
  - fond principal / fond sidebar changent,
  - couleur d'accent (titres, tags, barres) change,
  - contraste texte reste lisible.
- Résultat attendu: le changement est visible sur toute la sortie via le pipeline unique (`ResumeRenderer` + `SectionRenderer` + `ResumeSection*`).

### 2) Rounded

- Action: alterner `selectedRounded` (ex: faible rayon ↔ fort rayon).
- Vérifier:
  - cards/blocs/encadrés changent bien de rayon,
  - photo/frame et conteneurs reflètent le changement.
- Résultat attendu: les coins changent visiblement sans casser la mise en page.

### 3) Typographie

- Action: changer `selectedTextStyle` sur au moins 2 styles contrastés.
- Vérifier:
  - famille de police change,
  - poids/gras perçu des headings + body change,
  - retours à la ligne restent acceptables (pas de collision majeure).
- Résultat attendu: police et poids changent sur header et sur toutes les sections rendues par `SectionRenderer`.

### 4) Density + Dividers

- Action: basculer `density` (`compact` ↔ `comfortable`) et `dividerStyle` (`none`/`line`/`thick`).
- Vérifier:
  - espacement vertical inter-sections et intra-sections change,
  - séparateurs apparaissent/disparaissent/changent d'épaisseur,
  - lisibilité conservée en multi-pages.
- Résultat attendu: spacing/séparateurs changent clairement, sans overlap.

## Matrice d'exécution (à cocher pendant la recette)

| Template       | Palette | Rounded | Typo | Density/Divider | Notes |
| -------------- | ------- | ------- | ---- | --------------- | ----- |
| classic        | ☐       | ☐       | ☐    | ☐               |       |
| modern         | ☐       | ☐       | ☐    | ☐               |       |
| professional   | ☐       | ☐       | ☐    | ☐               |       |
| traditional    | ☐       | ☐       | ☐    | ☐               |       |
| creative       | ☐       | ☐       | ☐    | ☐               |       |
| minimalist     | ☐       | ☐       | ☐    | ☐               |       |
| executive      | ☐       | ☐       | ☐    | ☐               |       |
| aurora         | ☐       | ☐       | ☐    | ☐               |       |
| terra          | ☐       | ☐       | ☐    | ☐               |       |
| ocean-split    | ☐       | ☐       | ☐    | ☐               |       |
| corporate-blue | ☐       | ☐       | ☐    | ☐               |       |

## Renfort automatisé (test composant)

Un test composant protège le contrat minimal du renderer:

- changement de tokens de palette → style inline mis à jour,
- changement de rounded/text style → classes root mises à jour,
- changement density/divider → classes root mises à jour,
- validé sur chaque skin déclarée.

Fichier de test: `test/nuxt/resume-renderer-design-controls.test.ts`.

## Critère de sortie refactor

Le refactor design est validé si:

1. 100% des cases de la matrice sont cochées pour les templates en portée.
2. Le test composant lié au renderer passe.
3. Aucun écart visuel bloquant n'est détecté en preview multi-pages.
