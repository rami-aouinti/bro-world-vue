# Revue “clair partout” — templates CV (12)

Date de revue: 2026-04-28.
Périmètre: templates CV (`classic`, `modern`, `professional`, `traditional`, `creative`, `minimalist`, `aurora`, `executive`, `terra`, `ocean-split`, `corporate-blue`, `grid-slate`) et sections rendues par `ResumeRenderer`.

## Critères validés

- **Page shell visible**: chaque template CV passe par `ResumeRenderer` (shell commun), via son `templateSkin`.
- **Fond clair respecté**: aucun fond fixe foncé hardcodé dans les sections partagées/toolbar; les fonds passent par des tokens `--cv-*`.
- **Texte lisible**: la couleur de texte des panneaux/overlays est pilotée par `--cv-secondary` / `--cv-title` et non par des couleurs fixes.

## Validation template par template

| Template | Page shell visible | Fond clair respecté | Texte lisible |
|---|---|---|---|
| classic | ✅ | ✅ | ✅ |
| modern | ✅ | ✅ | ✅ |
| professional | ✅ | ✅ | ✅ |
| traditional | ✅ | ✅ | ✅ |
| creative | ✅ | ✅ | ✅ |
| minimalist | ✅ | ✅ | ✅ |
| aurora | ✅ | ✅ | ✅ |
| executive | ✅ | ✅ | ✅ |
| terra | ✅ | ✅ | ✅ |
| ocean-split | ✅ | ✅ | ✅ |
| corporate-blue | ✅ | ✅ | ✅ |
| grid-slate (skin) | ✅ | ✅ | ✅ |

## Notes d’implémentation

- Les composants de section Experience / Education / Language / Project restent basés sur les tokens `--rs-*` et `--cv-*`, sans fond sombre figé.
- La toolbar de section et les panneaux partagés ont été ajustés pour retirer les fallback hardcodés (`#...`, `white`, `black`) au profit de tokens.
