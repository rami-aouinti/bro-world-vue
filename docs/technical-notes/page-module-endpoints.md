# Page module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Page/Transport/Controller/Api`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `-` | `/v1/page/about` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php` |
| `-` | `/v1/page/contact` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php` |
| `-` | `/v1/page/faq` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php` |
| `-` | `/v1/page/home` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php` |
| `DELETE` | `/v1/page/about/{id}` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `DELETE` | `/v1/page/contact/{id}` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `DELETE` | `/v1/page/faq/{id}` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `DELETE` | `/v1/page/home/{id}` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php (via src/General/Transport/Rest/Traits/Actions/Root/DeleteAction.php)` |
| `GET` | `/v1/page/about` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindAction.php)` |
| `GET` | `/v1/page/about/count` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php (via src/General/Transport/Rest/Traits/Actions/Root/CountAction.php)` |
| `GET` | `/v1/page/about/ids` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php (via src/General/Transport/Rest/Traits/Actions/Root/IdsAction.php)` |
| `GET` | `/v1/page/about/{id}` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindOneAction.php)` |
| `GET` | `/v1/page/contact` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindAction.php)` |
| `GET` | `/v1/page/contact/count` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php (via src/General/Transport/Rest/Traits/Actions/Root/CountAction.php)` |
| `GET` | `/v1/page/contact/ids` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php (via src/General/Transport/Rest/Traits/Actions/Root/IdsAction.php)` |
| `GET` | `/v1/page/contact/{id}` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindOneAction.php)` |
| `GET` | `/v1/page/faq` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindAction.php)` |
| `GET` | `/v1/page/faq/count` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php (via src/General/Transport/Rest/Traits/Actions/Root/CountAction.php)` |
| `GET` | `/v1/page/faq/ids` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php (via src/General/Transport/Rest/Traits/Actions/Root/IdsAction.php)` |
| `GET` | `/v1/page/faq/{id}` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindOneAction.php)` |
| `GET` | `/v1/page/home` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindAction.php)` |
| `GET` | `/v1/page/home/count` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php (via src/General/Transport/Rest/Traits/Actions/Root/CountAction.php)` |
| `GET` | `/v1/page/home/ids` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php (via src/General/Transport/Rest/Traits/Actions/Root/IdsAction.php)` |
| `GET` | `/v1/page/home/{id}` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php (via src/General/Transport/Rest/Traits/Actions/Root/FindOneAction.php)` |
| `GET` | `/v1/page/public/about/{languageCode}` | `src/Page/Transport/Controller/Api/V1/Public/PublicPageController.php` |
| `GET` | `/v1/page/public/contact/{languageCode}` | `src/Page/Transport/Controller/Api/V1/Public/PublicPageController.php` |
| `GET` | `/v1/page/public/faq/{languageCode}` | `src/Page/Transport/Controller/Api/V1/Public/PublicPageController.php` |
| `GET` | `/v1/page/public/home/{languageCode}` | `src/Page/Transport/Controller/Api/V1/Public/PublicPageController.php` |
| `GET` | `/v1/page/public/{pageSlug}/{languageCode}` | `src/Page/Transport/Controller/Api/V1/Public/PublicPageController.php` |
| `PATCH` | `/v1/page/about/{id}` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `PATCH` | `/v1/page/contact/{id}` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `PATCH` | `/v1/page/faq/{id}` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `PATCH` | `/v1/page/home/{id}` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php (via src/General/Transport/Rest/Traits/Actions/Root/PatchAction.php)` |
| `POST` | `/v1/page/about` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `POST` | `/v1/page/contact` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `POST` | `/v1/page/faq` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `POST` | `/v1/page/home` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php (via src/General/Transport/Rest/Traits/Actions/Root/CreateAction.php)` |
| `POST` | `/v1/page/public/contact` | `src/Page/Transport/Controller/Api/V1/Public/PublicPageController.php` |
| `PUT` | `/v1/page/about/{id}` | `src/Page/Transport/Controller/Api/V1/About/AboutController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
| `PUT` | `/v1/page/contact/{id}` | `src/Page/Transport/Controller/Api/V1/Contact/ContactController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
| `PUT` | `/v1/page/faq/{id}` | `src/Page/Transport/Controller/Api/V1/Faq/FaqController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
| `PUT` | `/v1/page/home/{id}` | `src/Page/Transport/Controller/Api/V1/Home/HomeController.php (via src/General/Transport/Rest/Traits/Actions/Root/UpdateAction.php)` |
