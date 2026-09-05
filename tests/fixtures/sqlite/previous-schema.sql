-- Test-only legacy fixture. It intentionally predates the foundation migration.
CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL);
CREATE TABLE workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, root_handle TEXT NOT NULL, status TEXT NOT NULL, version INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
