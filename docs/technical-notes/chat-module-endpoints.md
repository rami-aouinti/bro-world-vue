# Chat module endpoints

Liste extraite automatiquement des attributs `#[Route(...)]` du module `src/Chat/Transport/Controller/Api`.
Chemin HTTP final exposé par l’API : `/api` + `Path`.

| Method(s) | Path | Controller file |
|---|---|---|
| `DELETE` | `/v1/chat/private/conversations/{conversationId}` | `src/Chat/Transport/Controller/Api/V1/Conversation/DeleteConversationController.php` |
| `DELETE` | `/v1/chat/private/messages/{messageId}` | `src/Chat/Transport/Controller/Api/V1/Message/DeleteMessageController.php` |
| `DELETE` | `/v1/chat/private/reactions/{reactionId}` | `src/Chat/Transport/Controller/Api/V1/Reaction/DeleteReactionController.php` |
| `GET` | `/v1/chat/chats/{chat}/conversations` | `src/Chat/Transport/Controller/Api/V1/Conversation/ApplicationConversationListController.php` |
| `GET` | `/v1/chat/private/chats/{chatId}/conversations` | `src/Chat/Transport/Controller/Api/V1/Conversation/ApplicationUserConversationListController.php` |
| `GET` | `/v1/chat/private/conversations` | `src/Chat/Transport/Controller/Api/V1/Conversation/UserConversationListController.php` |
| `GET` | `/v1/chat/private/conversations/{conversationId}` | `src/Chat/Transport/Controller/Api/V1/Message/ListConversationMessagesController.php` |
| `PATCH` | `/v1/chat/private/conversations/{conversationId}` | `src/Chat/Transport/Controller/Api/V1/Conversation/PatchConversationController.php` |
| `PATCH` | `/v1/chat/private/messages/{messageId}` | `src/Chat/Transport/Controller/Api/V1/Message/PatchMessageController.php` |
| `PATCH` | `/v1/chat/private/reactions/{reactionId}` | `src/Chat/Transport/Controller/Api/V1/Reaction/PatchReactionController.php` |
| `POST` | `/v1/chat/private/chats/{chatId}/conversations` | `src/Chat/Transport/Controller/Api/V1/Conversation/CreateConversationController.php` |
| `POST` | `/v1/chat/private/conversation/{user}/user` | `src/Chat/Transport/Controller/Api/V1/Conversation/FindOrCreateConversationWithUserController.php` |
| `POST` | `/v1/chat/private/conversations/{conversationId}/messages` | `src/Chat/Transport/Controller/Api/V1/Message/CreateMessageController.php` |
| `POST` | `/v1/chat/private/conversations/{conversationId}/messages/read` | `src/Chat/Transport/Controller/Api/V1/Message/MarkConversationAsReadController.php` |
| `POST` | `/v1/chat/private/messages/{messageId}/reactions` | `src/Chat/Transport/Controller/Api/V1/Reaction/CreateReactionController.php` |
