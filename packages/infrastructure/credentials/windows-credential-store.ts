import { failure, type RequestContext, type Result } from '@uniforge/contracts';
const secretToken = Symbol('secret');
export class SecretHandle {
  readonly [secretToken]: string;
  constructor(value: string) {
    this[secretToken] = value;
    Object.freeze(this);
  }
  toString(): string {
    throw new Error('SecretHandle cannot be stringified');
  }
  toJSON(): never {
    throw new Error('SecretHandle cannot be serialized');
  }
  getValue(token: symbol): string {
    if (token !== secretToken) throw new Error('Invalid secret access');
    return this[secretToken];
  }
}
export interface CredentialStore {
  get(ref: string, context: RequestContext): Promise<Result<SecretHandle>>;
  set(ref: string, secret: SecretHandle, context: RequestContext): Promise<Result<void>>;
  delete(ref: string, context: RequestContext): Promise<Result<void>>;
}
export class InMemoryCredentialStore implements CredentialStore {
  private readonly values = new Map<string, SecretHandle>();
  async get(ref: string, context: RequestContext) {
    const value = this.values.get(ref);
    return value
      ? { ok: true as const, value }
      : failure('NOT_FOUND', 'Credential not found', context.correlationId);
  }
  async set(ref: string, secret: SecretHandle) {
    this.values.set(ref, secret);
    return { ok: true as const, value: undefined };
  }
  async delete(ref: string) {
    this.values.delete(ref);
    return { ok: true as const, value: undefined };
  }
}
export class WindowsCredentialStore implements CredentialStore {
  async get(_ref: string, context: RequestContext) {
    return failure(
      'UNAVAILABLE',
      'Windows Credential Manager adapter is unavailable in this build',
      context.correlationId,
    );
  }
  async set(_ref: string, _secret: SecretHandle, context: RequestContext) {
    return failure(
      'UNAVAILABLE',
      'Windows Credential Manager adapter is unavailable in this build',
      context.correlationId,
    );
  }
  async delete(_ref: string, context: RequestContext) {
    return failure(
      'UNAVAILABLE',
      'Windows Credential Manager adapter is unavailable in this build',
      context.correlationId,
    );
  }
}
