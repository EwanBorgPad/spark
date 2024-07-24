-- D1 Database doesn't support JSON, JSONB, nor TIMESTAMP type columns, so I've resorted to TEXT in those places

CREATE TABLE "user" (
    address TEXT NOT NULL PRIMARY KEY,
    twitter_id TEXT NOT NULL,
    json JSONB NOT NULL DEFAULT '{}'
);
CREATE TABLE project (
    id TEXT NOT NULL PRIMARY KEY,
    json JSONB NOT NULL DEFAULT '{}'
);
CREATE TABLE cache_store (
    cache_key TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    expiration_at TIMESTAMP NOT NULL,
    cache_data JSONB NOT NULL DEFAULT '{}'
);
