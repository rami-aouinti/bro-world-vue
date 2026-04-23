# Role module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Role/Transport/Controller/Api/V1`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `-` | `/v1/role` | `src/Role/Transport/Controller/Api/V1/Role/RoleController.php` |
| `GET` | `/v1/role` | `src/Role/Transport/Controller/Api/V1/Role/RoleController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindAction.php)` |
| `GET` | `/v1/role/count` | `src/Role/Transport/Controller/Api/V1/Role/RoleController.php (via src/General/Transport/Rest/Traits/Actions/Admin/CountAction.php)` |
| `GET` | `/v1/role/ids` | `src/Role/Transport/Controller/Api/V1/Role/RoleController.php (via src/General/Transport/Rest/Traits/Actions/Admin/IdsAction.php)` |
| `GET` | `/v1/role/{role}` | `src/Role/Transport/Controller/Api/V1/Role/FindOneRoleController.php` |
| `GET` | `/v1/role/{role}/inherited` | `src/Role/Transport/Controller/Api/V1/Role/InheritedRolesController.php` |
