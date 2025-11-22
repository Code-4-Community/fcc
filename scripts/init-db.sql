-- Database initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create user first if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'fcc_user') THEN
        CREATE USER fcc_user WITH PASSWORD 'fcc_password';
    END IF;
END
$$;

-- Create the main database if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fcc_dev') THEN
        CREATE DATABASE fcc_dev OWNER fcc_user;
    END IF;
END
$$;

-- Create a test database for running tests
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fcc_test') THEN
        CREATE DATABASE fcc_test OWNER fcc_user;
    END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fcc_dev TO fcc_user;
GRANT ALL PRIVILEGES ON DATABASE fcc_test TO fcc_user;

-- Enable necessary PostgreSQL extensions
\c fcc_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c fcc_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log completion
\echo 'Database initialization completed!'
