# Calendar module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Calendar/Transport/Controller/Api/V1`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `DELETE` | `/v1/calendar/events/{eventId}` | `src/Calendar/Transport/Controller/Api/V1/Event/DeleteApplicationEventController.php` |
| `DELETE` | `/v1/calendar/private/events/{eventId}` | `src/Calendar/Transport/Controller/Api/V1/Event/DeletePrivateEventController.php` |
| `GET` | `/v1/calendar/events` | `src/Calendar/Transport/Controller/Api/V1/Event/ApplicationEventListController.php` |
| `GET` | `/v1/calendar/events/me` | `src/Calendar/Transport/Controller/Api/V1/Event/ApplicationUserEventListController.php` |
| `GET` | `/v1/calendar/events/upcoming` | `src/Calendar/Transport/Controller/Api/V1/Event/UpcomingEventListController.php` |
| `GET` | `/v1/calendar/private/events` | `src/Calendar/Transport/Controller/Api/V1/Event/UserEventListController.php` |
| `PATCH` | `/v1/calendar/events/{eventId}` | `src/Calendar/Transport/Controller/Api/V1/Event/PatchApplicationEventController.php` |
| `PATCH` | `/v1/calendar/private/events/{eventId}` | `src/Calendar/Transport/Controller/Api/V1/Event/PatchPrivateEventController.php` |
| `POST` | `/v1/calendar/events` | `src/Calendar/Transport/Controller/Api/V1/Event/CreateApplicationEventController.php` |
| `POST` | `/v1/calendar/events/{eventId}/cancel` | `src/Calendar/Transport/Controller/Api/V1/Event/CancelApplicationEventController.php` |
| `POST` | `/v1/calendar/private/events` | `src/Calendar/Transport/Controller/Api/V1/Event/CreatePrivateEventController.php` |
| `POST` | `/v1/calendar/private/events/google/sync` | `src/Calendar/Transport/Controller/Api/V1/Event/SyncPrivateGoogleEventController.php` |
| `POST` | `/v1/calendar/private/events/{eventId}/cancel` | `src/Calendar/Transport/Controller/Api/V1/Event/CancelPrivateEventController.php` |
