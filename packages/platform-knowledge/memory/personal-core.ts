import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export class PersonalCore {
  constructor(readonly db: DatabaseSync) {
    db.exec(
      readFileSync(fileURLToPath(new URL('./migrations/0001-poc.sql', import.meta.url)), 'utf8'),
    );
  }
  close(): void {
    this.db.close();
  }
}
