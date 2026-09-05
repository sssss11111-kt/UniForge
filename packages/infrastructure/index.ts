export { openDatabase, type DatabaseHandle, type DatabaseMode } from './sqlite/database.js';
export { migrate, type Migration } from './sqlite/migration-runner.js';
export { withTransaction } from './sqlite/transaction.js';
export {
  InMemoryCredentialStore,
  WindowsCredentialStore,
  SecretHandle,
  type CredentialStore,
} from './credentials/windows-credential-store.js';
export { redactSecrets } from './logging/redact.js';
export { StructuredLogger, type LogEntry, type LogLevel } from './logging/structured.js';
export {
  createBackup,
  restoreBackup,
  validateBackup,
  type BackupInput,
  type BackupManifest,
  type ManagedBackupFile,
} from './backup/service.js';
export { ProcessSupervisor } from './processes/supervisor.js';
export { checkNativeSqliteBinding, type NativeSqliteCheck } from './sqlite/native-binding.js';
