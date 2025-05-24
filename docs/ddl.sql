-- D1 Database doesn't support JSON, JSONB, nor TIMESTAMP type columns
-- Even though the creation works as expected, the driver returns JSONB and TIMESTAMP as plain string in javascript
-- DROP TABLE user, project, cache_store;

CREATE TABLE user (
    address TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE
);

CREATE TABLE tokens (
    mint TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    isGraduated BOOLEAN NOT NULL
);

ALTER TABLE tokens
ADD COLUMN imageUrl TEXT;

ALTER TABLE tokens
ADD COLUMN dao TEXT;

CREATE TABLE error (
    id TEXT NOT NULL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    json JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE api_key (
    id TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    permissions TEXT NOT NULL,
    hash TEXT NOT NULL
);



