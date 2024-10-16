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
-- Migration for adding created_at timestamp to project 
-- Reason why we have written with 2 commands is because of SQLite: https://stackoverflow.com/questions/61966855/how-to-add-column-to-database-with-default
ALTER TABLE project ADD created_at TIMESTAMP;
UPDATE project SET created_at = CURRENT_TIMESTAMP;
