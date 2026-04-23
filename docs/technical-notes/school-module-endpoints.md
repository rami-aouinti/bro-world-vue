# School module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/School/Transport/Controller/Api/V1`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `DELETE` | `/v1/school/classes/{id}` | `src/School/Transport/Controller/Api/V1/Class/DeleteClassController.php` |
| `DELETE` | `/v1/school/classes/{id}/teachers/{teacherId}` | `src/School/Transport/Controller/Api/V1/Class/UnassignClassTeacherController.php` |
| `DELETE` | `/v1/school/exams/{id}` | `src/School/Transport/Controller/Api/V1/Exam/DeleteExamController.php` |
| `DELETE` | `/v1/school/grades/{id}` | `src/School/Transport/Controller/Api/V1/Grade/DeleteGradeController.php` |
| `DELETE` | `/v1/school/students/{id}` | `src/School/Transport/Controller/Api/V1/Student/DeleteStudentController.php` |
| `DELETE` | `/v1/school/teachers/{id}` | `src/School/Transport/Controller/Api/V1/Teacher/DeleteTeacherController.php` |
| `GET` | `/v1/school/classes` | `src/School/Transport/Controller/Api/V1/Class/ListClassesByApplicationController.php` |
| `GET` | `/v1/school/exams` | `src/School/Transport/Controller/Api/V1/Exam/ListExamsController.php` |
| `GET` | `/v1/school/grades` | `src/School/Transport/Controller/Api/V1/Grade/ListGradesController.php` |
| `GET` | `/v1/school/students` | `src/School/Transport/Controller/Api/V1/Student/ListStudentsController.php` |
| `GET` | `/v1/school/teachers` | `src/School/Transport/Controller/Api/V1/Teacher/ListTeachersController.php` |
| `GET` | `/v1/school/{resource}` | `src/School/Transport/Controller/Api/V1/SchoolApplicationResourceListController.php` |
| `GET` | `/v1/school/{resource}/{id}` | `src/School/Transport/Controller/Api/V1/Application/GetSchoolApplicationResourceController.php` |
| `GET` | `/v1/school/{resource}/{id}` | `src/School/Transport/Controller/Api/V1/General/GetGeneralSchoolResourceController.php` |
| `PATCH|PUT` | `/v1/school/{resource}/{id}` | `src/School/Transport/Controller/Api/V1/Application/PatchSchoolApplicationResourceController.php` |
| `POST` | `/v1/school/classes` | `src/School/Transport/Controller/Api/V1/Class/CreateClassByApplicationController.php` |
| `POST` | `/v1/school/classes/{id}/teachers/{teacherId}` | `src/School/Transport/Controller/Api/V1/Class/AssignClassTeacherController.php` |
| `POST` | `/v1/school/courses` | `src/School/Transport/Controller/Api/V1/Course/CreateCourseController.php` |
| `POST` | `/v1/school/exams` | `src/School/Transport/Controller/Api/V1/Exam/CreateExamController.php` |
| `POST` | `/v1/school/grades` | `src/School/Transport/Controller/Api/V1/Grade/CreateGradeController.php` |
| `POST` | `/v1/school/students` | `src/School/Transport/Controller/Api/V1/Student/CreateStudentController.php` |
| `POST` | `/v1/school/teachers` | `src/School/Transport/Controller/Api/V1/Teacher/CreateTeacherController.php` |
