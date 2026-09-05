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
