# User module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/User/Transport/Controller/Api/V1`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `-` | `/v1/user` | `src/User/Transport/Controller/Api/V1/User/UserController.php` |
| `-` | `/v1/user_group` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php` |
| `DELETE` | `/v1/private/stories/{id}` | `src/User/Transport/Controller/Api/V1/UserStory/DeleteUserStoryController.php` |
| `DELETE` | `/v1/user/{user}` | `src/User/Transport/Controller/Api/V1/User/DeleteUserController.php` |
| `DELETE` | `/v1/user/{user}/group/{userGroup}` | `src/User/Transport/Controller/Api/V1/User/DetachUserGroupController.php` |
| `DELETE` | `/v1/user_group/{id}` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `DELETE` | `/v1/user_group/{userGroup}/user/{user}` | `src/User/Transport/Controller/Api/V1/UserGroup/DetachUserController.php` |
| `DELETE` | `/v1/users/me` | `src/User/Transport/Controller/Api/V1/User/UserMeController.php` |
| `DELETE` | `/v1/users/{user}/block` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `GET` | `/v1/private/stories` | `src/User/Transport/Controller/Api/V1/UserStory/GetActiveStoriesController.php` |
| `GET` | `/v1/profile` | `src/User/Transport/Controller/Api/V1/Profile/IndexController.php` |
| `GET` | `/v1/profile/configuration/{configurationKey}` | `src/User/Transport/Controller/Api/V1/Profile/ConfigurationController.php` |
| `GET` | `/v1/profile/groups` | `src/User/Transport/Controller/Api/V1/Profile/GroupsController.php` |
| `GET` | `/v1/profile/roles` | `src/User/Transport/Controller/Api/V1/Profile/RolesController.php` |
| `GET` | `/v1/public/user/{username}` | `src/User/Transport/Controller/Api/V1/User/PublicUserController.php` |
| `GET` | `/v1/public/users` | `src/User/Transport/Controller/Api/V1/User/PublicUserListController.php` |
| `GET` | `/v1/user` | `src/User/Transport/Controller/Api/V1/User/UserController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindAction.php)` |
| `GET` | `/v1/user/count` | `src/User/Transport/Controller/Api/V1/User/UserController.php (via src/General/Transport/Rest/Traits/Actions/Admin/CountAction.php)` |
| `GET` | `/v1/user/ids` | `src/User/Transport/Controller/Api/V1/User/UserController.php (via src/General/Transport/Rest/Traits/Actions/Admin/IdsAction.php)` |
| `GET` | `/v1/user/{id}` | `src/User/Transport/Controller/Api/V1/User/UserController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindOneAction.php)` |
| `GET` | `/v1/user/{user}/groups` | `src/User/Transport/Controller/Api/V1/User/UserGroupsController.php` |
| `GET` | `/v1/user/{user}/roles` | `src/User/Transport/Controller/Api/V1/User/UserRolesController.php` |
| `GET` | `/v1/user_group` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindAction.php)` |
| `GET` | `/v1/user_group/count` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php (via src/General/Transport/Rest/Traits/Actions/Admin/CountAction.php)` |
| `GET` | `/v1/user_group/ids` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php (via src/General/Transport/Rest/Traits/Actions/Admin/IdsAction.php)` |
| `GET` | `/v1/user_group/{id}` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php (via src/General/Transport/Rest/Traits/Actions/Admin/FindOneAction.php)` |
| `GET` | `/v1/user_group/{userGroup}/users` | `src/User/Transport/Controller/Api/V1/UserGroup/UsersController.php` |
| `GET` | `/v1/users/me` | `src/User/Transport/Controller/Api/V1/User/UserMeController.php` |
| `GET` | `/v1/users/me/applications` | `src/User/Transport/Controller/Api/V1/User/UserMeController.php` |
| `GET` | `/v1/users/me/applications/latest` | `src/User/Transport/Controller/Api/V1/User/UserMeController.php` |
| `GET` | `/v1/users/me/friends` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `GET` | `/v1/users/me/friends/blocked` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `GET` | `/v1/users/me/friends/requests` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `GET` | `/v1/users/me/friends/requests/sent` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `GET` | `/v1/users/me/profile` | `src/User/Transport/Controller/Api/V1/User/UserMeController.php` |
| `GET` | `/v1/users/me/sessions` | `src/User/Transport/Controller/Api/V1/User/UserMeController.php` |
| `PATCH` | `/v1/profile` | `src/User/Transport/Controller/Api/V1/Profile/PatchController.php` |
| `PATCH` | `/v1/profile/configuration/{configurationKey}` | `src/User/Transport/Controller/Api/V1/Profile/ConfigurationPatchController.php` |
| `PATCH` | `/v1/user/{id}` | `src/User/Transport/Controller/Api/V1/User/UserController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `PATCH` | `/v1/user_group/{id}` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `PATCH` | `/v1/users/me/password` | `src/User/Transport/Controller/Api/V1/User/UserMeController.php` |
| `PATCH` | `/v1/users/me/profile` | `src/User/Transport/Controller/Api/V1/User/UserMeController.php` |
| `POST` | `/v1/auth/get_token` | `src/User/Transport/Controller/Api/V1/Auth/GetTokenController.php` |
| `POST` | `/v1/auth/register` | `src/User/Transport/Controller/Api/V1/Auth/RegisterController.php` |
| `POST` | `/v1/auth/social_login` | `src/User/Transport/Controller/Api/V1/Auth/SocialLoginController.php` |
| `POST` | `/v1/private/stories` | `src/User/Transport/Controller/Api/V1/UserStory/CreateUserStoryController.php` |
| `POST` | `/v1/profile/applications` | `src/User/Transport/Controller/Api/V1/Profile/ApplicationCreateController.php` |
| `POST` | `/v1/profile/applications/{application}/photo` | `src/User/Transport/Controller/Api/V1/Profile/ApplicationUploadPhotoController.php` |
| `POST` | `/v1/profile/configuration` | `src/User/Transport/Controller/Api/V1/Profile/ConfigurationCreateController.php` |
| `POST` | `/v1/profile/photo` | `src/User/Transport/Controller/Api/V1/Profile/UploadPhotoController.php` |
| `POST` | `/v1/profile/platforms/{platform}/photo` | `src/User/Transport/Controller/Api/V1/Profile/PlatformUploadPhotoController.php` |
| `POST` | `/v1/profile/plugins/{plugin}/photo` | `src/User/Transport/Controller/Api/V1/Profile/PluginUploadPhotoController.php` |
| `POST` | `/v1/user` | `src/User/Transport/Controller/Api/V1/User/UserController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `POST` | `/v1/user/{user}/group/{userGroup}` | `src/User/Transport/Controller/Api/V1/User/AttachUserGroupController.php` |
| `POST` | `/v1/user_group` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `POST` | `/v1/user_group/{userGroup}/user/{user}` | `src/User/Transport/Controller/Api/V1/UserGroup/AttachUserController.php` |
| `POST` | `/v1/users/{user}/block` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `POST` | `/v1/users/{user}/friends/accept` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `POST` | `/v1/users/{user}/friends/cancel` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `POST` | `/v1/users/{user}/friends/reject` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `POST` | `/v1/users/{user}/friends/request` | `src/User/Transport/Controller/Api/V1/User/UserFriendController.php` |
| `PUT` | `/v1/user/{id}` | `src/User/Transport/Controller/Api/V1/User/UserController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
| `PUT` | `/v1/user_group/{id}` | `src/User/Transport/Controller/Api/V1/UserGroup/UserGroupController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
