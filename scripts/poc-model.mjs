// The network PoC is deliberately explicit: credentials and endpoint authorization
// must be supplied by the operator. A missing authorization is reported as BLOCKED.
const required = ['UNIFORGE_MODEL_OPENAI_ENDPOINT', 'UNIFORGE_MODEL_ANTHROPIC_ENDPOINT'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.log(
    JSON.stringify({
      status: 'BLOCKED',
      reason: 'No authorized model endpoints configured',
      missing,
    }),
  );
  process.exitCode = 2;
} else {
  console.log(
    JSON.stringify({
      status: 'READY',
      note: 'Run with non-sensitive synthetic text and record usage/cost-knownness.',
    }),
  );
}
