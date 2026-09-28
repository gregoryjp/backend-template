-- Runs only on first container init (empty volume). The `app` superuser owns
-- both databases. Tests refuse to touch anything other than `app_test`.
CREATE DATABASE app_test OWNER app;
