# Shop module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Shop/Transport/Controller/Api/V1`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `DELETE` | `/v1/shop/carts/{shopId}/items/{itemId}` | `src/Shop/Transport/Controller/Api/V1/Cart/DeleteCartItemController.php` |
| `DELETE` | `/v1/shop/categories/{id}` | `src/Shop/Transport/Controller/Api/V1/Category/DeleteCategoryController.php` |
| `DELETE` | `/v1/shop/products/{id}` | `src/Shop/Transport/Controller/Api/V1/Product/DeleteProductController.php` |
| `DELETE` | `/v1/shop/tags/{id}` | `src/Shop/Transport/Controller/Api/V1/Tag/DeleteTagController.php` |
| `GET` | `/v1/shop/applcations/products` | `src/Shop/Transport/Controller/Api/V1/ApplicationProduct/ListApplicationProductsController.php` |
| `GET` | `/v1/shop/carts/{shopId}` | `src/Shop/Transport/Controller/Api/V1/Cart/GetCartController.php` |
| `GET` | `/v1/shop/categories` | `src/Shop/Transport/Controller/Api/V1/Category/ListCategoriesController.php` |
| `GET` | `/v1/shop/general` | `src/Shop/Transport/Controller/Api/V1/General/GetGeneralShopController.php` |
| `GET` | `/v1/shop/legacy/products` | `src/Shop/Transport/Controller/Api/V1/Product/ListProductsController.php` |
| `GET` | `/v1/shop/products` | `src/Shop/Transport/Controller/Api/V1/General/ListGeneralProductsController.php` |
| `GET` | `/v1/shop/products/{id}` | `src/Shop/Transport/Controller/Api/V1/Product/GetProductController.php` |
| `GET` | `/v1/shop/tags` | `src/Shop/Transport/Controller/Api/V1/Tag/ListTagsController.php` |
| `PATCH` | `/v1/shop/carts/{shopId}/items/{itemId}` | `src/Shop/Transport/Controller/Api/V1/Cart/PatchCartItemController.php` |
| `PATCH` | `/v1/shop/products/{id}` | `src/Shop/Transport/Controller/Api/V1/Product/PatchProductController.php` |
| `POST` | `/v1/shop/carts/{shopId}/items` | `src/Shop/Transport/Controller/Api/V1/Cart/AddCartItemController.php` |
| `POST` | `/v1/shop/categories` | `src/Shop/Transport/Controller/Api/V1/Category/CreateCategoryController.php` |
| `POST` | `/v1/shop/checkout/{shopId}` | `src/Shop/Transport/Controller/Api/V1/Checkout/CheckoutController.php` |
| `POST` | `/v1/shop/legacy/products` | `src/Shop/Transport/Controller/Api/V1/Product/CreateProductController.php` |
| `POST` | `/v1/shop/orders/{orderId}/payment-confirm` | `src/Shop/Transport/Controller/Api/V1/Payment/ConfirmPaymentController.php` |
| `POST` | `/v1/shop/orders/{orderId}/payment-intent` | `src/Shop/Transport/Controller/Api/V1/Payment/CreatePaymentIntentController.php` |
| `POST` | `/v1/shop/payments/webhook` | `src/Shop/Transport/Controller/Api/V1/Payment/PaymentWebhookController.php` |
| `POST` | `/v1/shop/products` | `src/Shop/Transport/Controller/Api/V1/ApplicationProduct/CreateApplicationProductController.php` |
| `POST` | `/v1/shop/tags` | `src/Shop/Transport/Controller/Api/V1/Tag/CreateTagController.php` |
