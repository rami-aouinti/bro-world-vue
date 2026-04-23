# Game module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Game/Transport/Controller/Api`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `DELETE` | `/v1/game-categories/{id}` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
| `DELETE` | `/v1/game-levels/{id}` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
| `GET` | `/v1/game-categories` | `src/Game/Transport/Controller/Api/V1/GameCategoryController.php` |
| `GET` | `/v1/game-categories/{id}` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
| `GET` | `/v1/game-levels` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
| `GET` | `/v1/game-levels/{id}` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
| `GET` | `/v1/games` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `GET` | `/v1/games/{id}` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `GET` | `/v1/games/{id}/leaderboard` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `GET` | `/v1/games/{id}/statistics` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `GET` | `/v1/public/game-catalog` | `src/Game/Transport/Controller/Api/V1/PublicGameCatalogController.php` |
| `POST` | `/v1/game-categories` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
| `POST` | `/v1/game-levels` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
| `POST` | `/v1/games` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `POST` | `/v1/games/sessions/{session}/finish` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `POST` | `/v1/games/{game}/sessions/start` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `POST` | `/v1/games/{id}/plays/start` | `src/Game/Transport/Controller/Api/V1/StartGameController.php` |
| `POST` | `/v1/games/{id}/plays/{sessionId}/result` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `POST` | `/v1/games/{id}/sessions` | `src/Game/Transport/Controller/Api/V1/GameController.php` |
| `PUT|PATCH` | `/v1/game-categories/{id}` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
| `PUT|PATCH` | `/v1/game-levels/{id}` | `src/Game/Transport/Controller/Api/V1/GameTaxonomyController.php` |
