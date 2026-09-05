export function redactSecrets(value: unknown): unknown {
  if (typeof value === 'string')
    return value
      .replace(/(sk-[A-Za-z0-9_-]{4})[A-Za-z0-9_-]+/g, '$1[REDACTED]')
      .replace(/(api[_-]?key\s*[:=]\s*)[^\s,]+/gi, '$1[REDACTED]');
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        /secret|token|key|password|cookie/i.test(k) ? k : k,
        /secret|token|key|password|cookie/i.test(k) ? '[REDACTED]' : redactSecrets(v),
      ]),
    );
  return value;
}
