# Platform module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Platform/Transport/Controller/Api/V1`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `-` | `/v1/platform` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php` |
| `-` | `/v1/plugin` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php` |
| `DELETE` | `/v1/platform/{id}` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `DELETE` | `/v1/plugin/{id}` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `GET` | `/v1/application/private` | `src/Platform/Transport/Controller/Api/V1/Application/PrivateApplicationListController.php` |
| `GET` | `/v1/application/private/view` | `src/Platform/Transport/Controller/Api/V1/Application/ApplicationViewController.php` |
| `GET` | `/v1/application/public` | `src/Platform/Transport/Controller/Api/V1/Application/PublicApplicationListController.php` |
| `GET` | `/v1/application/public/general` | `src/Platform/Transport/Controller/Api/V1/Application/PublicGeneralApplicationCatalogController.php` |
| `GET` | `/v1/platform` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindAction.php)` |
| `GET` | `/v1/platform/count` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php (via src/General/Transport/Rest/Traits/Actions/Admin/CountAction.php)` |
| `GET` | `/v1/platform/ids` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php (via src/General/Transport/Rest/Traits/Actions/Admin/IdsAction.php)` |
| `GET` | `/v1/platform/public` | `src/Platform/Transport/Controller/Api/V1/Platform/PublicPlatformListController.php` |
| `GET` | `/v1/platform/{id}` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindOneAction.php)` |
| `GET` | `/v1/plugin` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindAction.php)` |
| `GET` | `/v1/plugin/count` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php (via src/General/Transport/Rest/Traits/Actions/Root/CountAction.php)` |
| `GET` | `/v1/plugin/ids` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php (via src/General/Transport/Rest/Traits/Actions/Root/IdsAction.php)` |
| `GET` | `/v1/plugin/public` | `src/Platform/Transport/Controller/Api/V1/Plugin/PublicPluginListController.php` |
| `GET` | `/v1/plugin/{id}` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindOneAction.php)` |
| `PATCH` | `/v1/platform/{id}` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `PATCH` | `/v1/plugin/{id}` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `POST` | `/v1/platform` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `POST` | `/v1/plugin` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `PUT` | `/v1/platform/{id}` | `src/Platform/Transport/Controller/Api/V1/Platform/PlatformController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
| `PUT` | `/v1/plugin/{id}` | `src/Platform/Transport/Controller/Api/V1/Plugin/PluginController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
