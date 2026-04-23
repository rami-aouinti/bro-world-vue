# Blog module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Blog/Transport/Controller/Api/V1`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `DELETE` | `/v1/private/blog/comments/{commentId}` | `src/Blog/Transport/Controller/Api/V1/Mutation/DeleteBlogCommentController.php` |
| `DELETE` | `/v1/private/blog/posts/{postId}` | `src/Blog/Transport/Controller/Api/V1/Mutation/DeleteBlogPostController.php` |
| `DELETE` | `/v1/private/blog/reactions/{reactionId}` | `src/Blog/Transport/Controller/Api/V1/Mutation/DeleteBlogReactionController.php` |
| `GET` | `/v1/blog/feed` | `src/Blog/Transport/Controller/Api/V1/Read/GetApplicationBlogController.php` |
| `GET` | `/v1/blog/posts/{slug}` | `src/Blog/Transport/Controller/Api/V1/Read/GetBlogPostBySlugController.php` |
| `GET` | `/v1/private/blog/posts/mine` | `src/Blog/Transport/Controller/Api/V1/Read/GetMyBlogPostsController.php` |
| `GET` | `/v1/private/blogs/general` | `src/Blog/Transport/Controller/Api/V1/Read/GetGeneralBlogController.php` |
| `GET` | `/v1/public/blogs/general` | `src/Blog/Transport/Controller/Api/V1/Read/GetPublicGeneralBlogController.php` |
| `GET` | `/v1/public/blogs/reactions/types` | `src/Blog/Transport/Controller/Api/V1/Read/GetBlogReactionTypesController.php` |
| `PATCH` | `/v1/private/blog/comments/{commentId}` | `src/Blog/Transport/Controller/Api/V1/Mutation/PatchBlogCommentController.php` |
| `PATCH` | `/v1/private/blog/posts/{postId}` | `src/Blog/Transport/Controller/Api/V1/Mutation/PatchBlogPostController.php` |
| `PATCH` | `/v1/private/blog/reactions/{reactionId}` | `src/Blog/Transport/Controller/Api/V1/Mutation/PatchBlogReactionController.php` |
| `POST` | `/v1/private/blog/comments/{commentId}/reactions` | `src/Blog/Transport/Controller/Api/V1/Mutation/CreateBlogReactionController.php` |
| `POST` | `/v1/private/blog/posts/{postId}/comments` | `src/Blog/Transport/Controller/Api/V1/Mutation/CreateBlogCommentController.php` |
| `POST` | `/v1/private/blog/posts/{postId}/reactions` | `src/Blog/Transport/Controller/Api/V1/Mutation/CreateBlogPostReactionController.php` |
| `POST` | `/v1/private/blogs/general` | `src/Blog/Transport/Controller/Api/V1/Mutation/CreateGeneralBlogController.php` |
| `POST` | `/v1/private/blogs/{blogId}/posts` | `src/Blog/Transport/Controller/Api/V1/Mutation/CreateBlogPostController.php` |
