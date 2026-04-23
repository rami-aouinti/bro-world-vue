# Configuration module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Configuration/Transport/Controller/Api`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `-` | `/v1/configuration` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php` |
| `DELETE` | `/v1/configuration/{id}` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `GET` | `/v1/configuration` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindAction.php)` |
| `GET` | `/v1/configuration/count` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php (via src/General/Transport/Rest/Traits/Actions/Admin/CountAction.php)` |
| `GET` | `/v1/configuration/ids` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php (via src/General/Transport/Rest/Traits/Actions/Admin/IdsAction.php)` |
| `GET` | `/v1/configuration/{id}` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindOneAction.php)` |
| `PATCH` | `/v1/configuration/{id}` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `POST` | `/v1/configuration` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `PUT` | `/v1/configuration/{id}` | `src/Configuration/Transport/Controller/Api/V1/Configuration/ConfigurationController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
