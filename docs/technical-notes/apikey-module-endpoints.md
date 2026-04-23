# ApiKey module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/ApiKey/Transport/Controller/Api/V1`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `-` | `/v1/api_key` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php` |
| `DELETE` | `/v1/api_key/{id}` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `GET` | `/v1/api_key` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindAction.php)` |
| `GET` | `/v1/api_key/count` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php (via src/General/Transport/Rest/Traits/Actions/Root/CountAction.php)` |
| `GET` | `/v1/api_key/ids` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php (via src/General/Transport/Rest/Traits/Actions/Root/IdsAction.php)` |
| `GET` | `/v1/api_key/{id}` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindOneAction.php)` |
| `PATCH` | `/v1/api_key/{id}` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `POST` | `/v1/api_key` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `PUT` | `/v1/api_key/{id}` | `src/ApiKey/Transport/Controller/Api/V1/ApiKey/ApiKeyController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
