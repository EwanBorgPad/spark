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
CREATE TABLE whitelist (
    address TEXT NOT NULL,
    project_id TEXT NOT NULL,
    tier_id TEXT NOT NULL,
    PRIMARY KEY (address, project_id)
);
CREATE TABLE nft_index (
    nft_address TEXT NOT NULL,
    collection_address TEXT NOT NULL,
    owner_address TEXT,
    quoted_at TIMESTAMP NOT NULL,
    json JSONB NOT NULL DEFAULT '{}',
    PRIMARY KEY (nft_address)
);
CREATE INDEX nft_index_owner_address_index ON nft_index(owner_address);

-- migration: user deposit
CREATE TABLE deposit (
    transaction_id TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    token_address TEXT NOT NULL,
    amount_deposited TEXT NOT NULL,
    project_id TEXT NOT NULL,
    tier_id TEXT NOT NULL,
    nft_address TEXT NOT NULL
);
CREATE INDEX deposit_from_address_index ON deposit(from_address);

-- migration: deposit add column json
ALTER TABLE deposit ADD COLUMN json JSONB NOT NULL DEFAULT '{}';

-- migration: create table claims
CREATE TABLE claim (
    transaction_id TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    token_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    project_id TEXT NOT NULL,
    json JSONB NOT NULL DEFAULT '{}'
);

-- migration: eligibility status snapshot
CREATE TABLE eligibility_status_snapshot (
    address TEXT NOT NULL,
    project_id TEXT NOT NULL,
    created_at DATE NOT NULL,
    eligibility_status JSONB NOT NULL,
    PRIMARY KEY (address, project_id)
)

-- migration: exchange_cache
CREATE TABLE exchange_cache (
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    
    current_price TEXT NOT NULL,
    quoted_from TEXT NOT NULL,
    quoted_at TEXT NOT NULL,
    is_pinned INTEGER NOT NULL DEFAULT FALSE,
    raw_exchange_response JSONB NOT NULL DEFAULT '{}',
    
    PRIMARY KEY (base_currency, target_currency)
);

INSERT INTO exchange_cache (base_currency, target_currency, current_price, quoted_from, quoted_at)
    VALUES ('swissborg', 'usd', 0, 'inserted-manually', CURRENT_TIMESTAMP);

-- token_balance
CREATE TABLE token_balance (
    owner_address TEXT NOT NULL,
    token_mint_address TEXT NOT NULL,
    quoted_at TIMESTAMP NOT NULL,
    ui_amount TEXT NOT NULL, 
    PRIMARY KEY (owner_address, token_mint_address)
);

---- migration: project status
-- introduce new column 'status' for projects, with 'pending' as default
ALTER TABLE project ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
-- update all existing projects to be 'active'
UPDATE project SET status = 'active' WHERE TRUE;

-- introduce created_at and updated_at columns
ALTER TABLE project ADD COLUMN created_at TIMESTAMP;
ALTER TABLE project ADD COLUMN updated_at TIMESTAMP;
-- update all existing projects to the same value
UPDATE project SET created_at = '2024-01-01T00:00:00.000Z' WHERE TRUE;
UPDATE project SET updated_at = '2024-01-01T00:00:00.000Z' WHERE TRUE;
---- end

---- migration: api keys
CREATE TABLE api_key (
    id TEXT NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    permissions TEXT NOT NULL,
    hash TEXT NOT NULL
);
---- end

---- migration: analyst and analyst_article - 21.03.2025
CREATE TABLE analyst (
    id TEXT NOT NULL PRIMARY KEY,
    twitter_id TEXT NOT NULL UNIQUE,
    twitter_username TEXT,
    twitter_name TEXT,
    twitter_avatar TEXT
);

CREATE TABLE analysis (
    id TEXT NOT NULL PRIMARY KEY,
    analyst_id TEXT NOT NULL,
    twitter_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    article_url TEXT NOT NULL,
    analyst_role TEXT NOT NULL,
    FOREIGN KEY (analyst_id) REFERENCES analyst(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

CREATE INDEX idx_analysis_project_id ON analysis(project_id);
---- end
