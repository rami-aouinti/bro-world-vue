# Quiz module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Quiz/Transport/Controller/Api`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `DELETE` | `/v1/quiz` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `DELETE` | `/v1/quiz/answers/{answerId}` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `DELETE` | `/v1/quiz/general` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `DELETE` | `/v1/quiz/questions/{questionId}` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `GET` | `/v1/private/quiz/general` | `src/Quiz/Transport/Controller/Api/V1/GetPrivateGeneralQuizController.php` |
| `GET` | `/v1/public/quiz/general` | `src/Quiz/Transport/Controller/Api/V1/GetPublicGeneralQuizController.php` |
| `GET` | `/v1/quiz` | `src/Quiz/Transport/Controller/Api/V1/GetQuizByApplicationController.php` |
| `GET` | `/v1/quiz/attempts` | `src/Quiz/Transport/Controller/Api/V1/GetQuizAttemptsByApplicationController.php` |
| `GET` | `/v1/quiz/stats` | `src/Quiz/Transport/Controller/Api/V1/GetQuizStatsByApplicationController.php` |
| `PATCH` | `/v1/quiz/answers/{answerId}/reorder` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `PATCH` | `/v1/quiz/publish` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `PATCH` | `/v1/quiz/questions/{questionId}/reorder` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `PATCH` | `/v1/quiz/unpublish` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `POST` | `/v1/quiz` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `POST` | `/v1/quiz/general` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `POST` | `/v1/quiz/questions` | `src/Quiz/Transport/Controller/Api/V1/CreateQuizQuestionController.php` |
| `POST` | `/v1/quiz/submit` | `src/Quiz/Transport/Controller/Api/V1/SubmitQuizByApplicationController.php` |
| `PUT` | `/v1/quiz` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `PUT` | `/v1/quiz/answers/{answerId}` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `PUT` | `/v1/quiz/general` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
| `PUT` | `/v1/quiz/questions/{questionId}` | `src/Quiz/Transport/Controller/Api/V1/QuizMutationController.php` |
