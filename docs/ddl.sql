-- D1 Database doesn't support JSON, JSONB, nor TIMESTAMP type columns
-- Even though the creation works as expected, the driver returns JSONB and TIMESTAMP as plain string in javascript
-- DROP TABLE user, project, cache_store;

CREATE TABLE "user" (
    address TEXT NOT NULL PRIMARY KEY,
    json JSONB NOT NULL DEFAULT '{}'
);
CREATE TABLE project (
    id TEXT NOT NULL PRIMARY KEY,
    json JSONB NOT NULL DEFAULT '{}'
);
CREATE TABLE cache_store (
    cache_key TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    cache_data JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE follower (
    id TEXT NOT NULL PRIMARY KEY,
    json JSONB NOT NULL DEFAULT '{}'
);
CREATE TABLE error (
    id TEXT NOT NULL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    json JSONB NOT NULL DEFAULT '{}'
);
