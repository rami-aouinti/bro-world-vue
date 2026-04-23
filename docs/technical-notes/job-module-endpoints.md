# Job module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Recruit/Transport/Controller/Api/V1/Job`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `DELETE` | `/v1/recruit/job/{id}` | `src/Recruit/Transport/Controller/Api/V1/Job/JobDeleteController.php` |
| `DELETE` | `/v1/recruit/jobs/{jobId}` | `src/Recruit/Transport/Controller/Api/V1/Job/JobDeleteFromApplicationController.php` |
| `GET` | `/v1/recruit/job` | `src/Recruit/Transport/Controller/Api/V1/Job/JobListController.php` |
| `GET` | `/v1/recruit/job/count` | `src/Recruit/Transport/Controller/Api/V1/Job/JobCountController.php` |
| `GET` | `/v1/recruit/job/ids` | `src/Recruit/Transport/Controller/Api/V1/Job/JobIdsController.php` |
| `GET` | `/v1/recruit/job/{id}` | `src/Recruit/Transport/Controller/Api/V1/Job/JobViewController.php` |
| `GET` | `/v1/recruit/private/jobs` | `src/Recruit/Transport/Controller/Api/V1/Job/PrivateJobListController.php` |
| `GET` | `/v1/recruit/private/jobs/stats` | `src/Recruit/Transport/Controller/Api/V1/Job/PrivateJobStatsController.php` |
| `GET` | `/v1/recruit/private/me/jobs` | `src/Recruit/Transport/Controller/Api/V1/Job/MyJobListController.php` |
| `GET` | `/v1/recruit/public/jobs` | `src/Recruit/Transport/Controller/Api/V1/Job/PublicJobListController.php` |
| `GET` | `/v1/recruit/public/jobs/{jobSlug}` | `src/Recruit/Transport/Controller/Api/V1/Job/PublicJobDetailController.php` |
| `PATCH` | `/v1/recruit/job/{id}` | `src/Recruit/Transport/Controller/Api/V1/Job/JobPatchController.php` |
| `PATCH` | `/v1/recruit/jobs/{jobId}` | `src/Recruit/Transport/Controller/Api/V1/Job/JobPatchFromApplicationController.php` |
| `PATCH` | `/v1/recruit/private/jobs/{jobId}` | `src/Recruit/Transport/Controller/Api/V1/Job/JobPatchFromApplicationController.php` |
| `POST` | `/v1/recruit/job` | `src/Recruit/Transport/Controller/Api/V1/Job/JobCreateController.php` |
| `POST` | `/v1/recruit/jobs` | `src/Recruit/Transport/Controller/Api/V1/Job/JobCreateFromApplicationController.php` |
| `PUT` | `/v1/recruit/job/{id}` | `src/Recruit/Transport/Controller/Api/V1/Job/JobUpdateController.php` |
