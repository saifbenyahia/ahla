-- ==========================================================================
-- Hive.tn — PostgreSQL Database Schema
-- Platform: Tunisian Crowdfunding ("Gardez ce que vous récoltez")
-- All monetary values (target_amount, minimum_amount, amount) are stored
-- in INTEGER representing MILLIMES (smallest Tunisian currency unit)
-- to completely avoid floating-point precision errors.
-- ==========================================================================


-- --------------------------------------------------------------------------
-- 0. EXTENSION: Enable UUID generation natively
-- --------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- --------------------------------------------------------------------------
-- 1. ENUM TYPES
-- --------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
    'USER',
    'ADMIN'
);

CREATE TYPE campaign_status AS ENUM (
    'DRAFT',
    'PENDING',
    'ACTIVE',
    'REJECTED',
    'CLOSED'
);

CREATE TYPE milestone_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TYPE pledge_status AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


-- --------------------------------------------------------------------------
-- 2. USERS TABLE
-- --------------------------------------------------------------------------

CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    role            user_role       NOT NULL DEFAULT 'USER',
    bank_details    TEXT            NULL,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index for fast login lookups by email
CREATE INDEX idx_users_email ON users (email);


-- --------------------------------------------------------------------------
-- 3. CAMPAIGNS TABLE
-- --------------------------------------------------------------------------

CREATE TABLE campaigns (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    porteur_id      UUID            NOT NULL,
    title           VARCHAR(500)    NOT NULL,
    description     TEXT            NOT NULL,
    category        VARCHAR(100)    NOT NULL,
    -- Stored in MILLIMES (e.g. 50 TND = 50000)
    target_amount   INTEGER         NOT NULL CHECK (target_amount > 0),
    status          campaign_status NOT NULL DEFAULT 'DRAFT',
    story           TEXT            NULL,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_campaigns_porteur
        FOREIGN KEY (porteur_id)
        REFERENCES users (id)
        ON DELETE RESTRICT   -- Prevent deleting a user who owns campaigns
        ON UPDATE CASCADE
);

-- Index for fetching campaigns by their owner (porteur)
CREATE INDEX idx_campaigns_porteur_id ON campaigns (porteur_id);
-- Index for filtering by status (ACTIVE, PENDING, etc.)
CREATE INDEX idx_campaigns_status ON campaigns (status);


-- --------------------------------------------------------------------------
-- 4. REWARDS TABLE
-- --------------------------------------------------------------------------

CREATE TABLE rewards (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID            NOT NULL,
    title           VARCHAR(500)    NOT NULL,
    -- Stored in MILLIMES
    minimum_amount  INTEGER         NOT NULL CHECK (minimum_amount > 0),

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rewards_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES campaigns (id)
        ON DELETE CASCADE    -- Rewards are deleted when their campaign is deleted
        ON UPDATE CASCADE
);

CREATE INDEX idx_rewards_campaign_id ON rewards (campaign_id);


-- --------------------------------------------------------------------------
-- 5. MILESTONES (JALONS) TABLE
-- --------------------------------------------------------------------------

CREATE TABLE milestones (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID                NOT NULL,
    title           VARCHAR(500)        NOT NULL,
    proof_url       TEXT                NULL,       -- URL uploaded by porteur as proof
    status          milestone_status    NOT NULL DEFAULT 'PENDING',

    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_milestones_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES campaigns (id)
        ON DELETE CASCADE    -- Milestones are deleted when their campaign is deleted
        ON UPDATE CASCADE
);

CREATE INDEX idx_milestones_campaign_id ON milestones (campaign_id);
-- Index to quickly find milestones awaiting admin review
CREATE INDEX idx_milestones_status ON milestones (status);


-- --------------------------------------------------------------------------
-- 6. PLEDGES (DONATIONS) TABLE
-- --------------------------------------------------------------------------

CREATE TABLE pledges (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID            NOT NULL,
    donateur_id     UUID            NOT NULL,
    -- Stored in MILLIMES
    amount          INTEGER         NOT NULL CHECK (amount > 0),
    status          pledge_status   NOT NULL DEFAULT 'PENDING',

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pledges_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES campaigns (id)
        ON DELETE RESTRICT   -- Preserve financial history; never cascade-delete pledges
        ON UPDATE CASCADE,

    CONSTRAINT fk_pledges_donateur
        FOREIGN KEY (donateur_id)
        REFERENCES users (id)
        ON DELETE RESTRICT   -- Preserve financial history; never cascade-delete pledges
        ON UPDATE CASCADE
);

-- Index for fetching all pledges for a specific campaign (e.g. total raised)
CREATE INDEX idx_pledges_campaign_id ON pledges (campaign_id);
-- Index for fetching a user's donation history
CREATE INDEX idx_pledges_donateur_id ON pledges (donateur_id);
-- Index for webhook processing (finding PENDING pledges to finalize)
CREATE INDEX idx_pledges_status ON pledges (status);


-- --------------------------------------------------------------------------
-- 7. AUTOMATIC updated_at TRIGGER
-- Updates the `updated_at` column automatically on every row modification.
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to every table
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_campaigns
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_rewards
    BEFORE UPDATE ON rewards
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_milestones
    BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_pledges
    BEFORE UPDATE ON pledges
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ==========================================================================
-- Schema initialization complete.
-- ==========================================================================
