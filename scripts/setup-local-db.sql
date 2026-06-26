-- Run with Postgres.app (or local PostgreSQL) as a superuser:
--   psql -h localhost -U <your-mac-username> -d postgres -f scripts/setup-local-db.sql

CREATE USER wedding WITH PASSWORD 'wedding' CREATEDB;

CREATE DATABASE wedding OWNER wedding;

\c wedding

GRANT ALL ON SCHEMA public TO wedding;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wedding;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO wedding;
