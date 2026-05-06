# Test visuel manuel — contrat `resume-section-hoverable`

Objectif: vérifier que chaque section éditable ciblée affiche bien `SectionToolbar` au hover/focus, avec le conteneur en `position: relative`, sur la première page **et** sur les pages suivantes.

## Pré-requis

1. Lancer l'app (`npm run dev`).
2. Ouvrir `/resume/cv/preview`.
3. Charger un CV avec suffisamment de contenu pour forcer plusieurs pages à l'export/preview.

## Sections à vérifier

- Experience
- Education
- Language
- Project
- Skills
- References
- Interests

## Procédure

1. Sur la première page, survoler chaque section listée.
2. Vérifier que la toolbar apparaît dans l'angle supérieur droit de la section.
3. Tabuler dans la section (focus clavier) et vérifier que la toolbar reste visible.
4. Aller sur une page suivante (zone de continuation/overflow).
5. Refaire les mêmes vérifications pour les sections présentes sur cette page.

## Résultat attendu

- Chaque section est enveloppée avec `resume-section-hoverable`.
- La section est un conteneur positionné (`position: relative`) pour ancrer `SectionToolbar`.
- `SectionToolbar` apparaît au hover/focus sur toutes les sections listées, y compris sur les pages suivantes.
