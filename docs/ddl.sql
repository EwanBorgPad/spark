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