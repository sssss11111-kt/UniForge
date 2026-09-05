# Third-party registry — Stage 0.1

Reviewed 2026-09-05. Versions are pinned in `package.json` and `package-lock.json`.

| Package                             | Version | License    | Evidence                                                                    | Windows / security review                                                           | Adoption |
| ----------------------------------- | ------: | ---------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| Electron                            |  44.2.0 | MIT        | https://github.com/electron/electron/blob/v44.2.0/LICENSE                   | Official Windows builds; Node >=22.12                                               | A        |
| Electron Forge CLI / Squirrel maker |  7.11.2 | MIT        | https://github.com/electron/forge/blob/v7.11.2/LICENSE                      | Official Windows packaging path                                                     | A        |
| @electron-forge/shared-types        |  7.11.2 | MIT        | https://github.com/electron/forge/blob/v7.11.2/LICENSE                      | Direct type-only build dependency; Windows supported                                | A        |
| TypeScript                          |   5.9.2 | Apache-2.0 | https://github.com/microsoft/TypeScript/blob/v5.9.2/LICENSE.txt             | Node/npm tool; Windows supported; selected for typescript-eslint peer compatibility | A        |
| Vitest                              |   5.0.0 | MIT        | https://github.com/vitest-dev/vitest/blob/v5.0.0/LICENSE.md                 | Node >=22.12/24; Windows supported                                                  | A        |
| Playwright                          |  1.63.0 | Apache-2.0 | https://github.com/microsoft/playwright/blob/v1.63.0/LICENSE                | Official Windows browser automation                                                 | A        |
| ESLint                              | 10.10.0 | MIT        | https://github.com/eslint/eslint/blob/v10.10.0/LICENSE                      | Node >=24; Windows supported                                                        | A        |
| Prettier                            |   3.9.6 | MIT        | https://github.com/prettier/prettier/blob/3.9.6/LICENSE                     | Node/npm tool; Windows supported                                                    | A        |
| @eslint/js                          |  10.0.1 | MIT        | https://github.com/eslint/eslint/blob/v10.0.1/LICENSE                       | Direct ESLint config dependency; Node >=24                                          | A        |
| typescript-eslint                   |  8.69.0 | MIT        | https://github.com/typescript-eslint/typescript-eslint/blob/v8.69.0/LICENSE | Direct parser/config dependency; Windows supported                                  | A        |
| globals                             |  16.3.0 | MIT        | https://github.com/sindresorhus/globals/blob/v16.3.0/license                | Direct ESLint config dependency; Windows supported                                  | A        |
| @types/node                         |  24.3.0 | MIT        | https://github.com/DefinitelyTyped/DefinitelyTyped/blob/HEAD/LICENSE        | Build-time types only; Windows supported                                            | A        |

No native SQLite binding, model asset, vocabulary corpus, or connector was adopted in Task 0.1. Electron is the development desktop runtime and is not yet a packaged release. Security advisories must be rechecked before upgrading or adding dependencies.

## Redistribution, sub-license, and maintenance disposition

All listed packages are redistributed only through the development lockfile at this stage; no installer or bundled runtime artifact is shipped. The packages are MIT, Apache-2.0, or the explicitly recorded `@types/node` MIT license, with no additional sub-license identified in the upstream license files. Upstream projects publish source and security advisories through their official repositories and npm packages; dependency updates remain pinned and require a new registry review. Electron Forge's transitive archive and extraction advisories are recorded in the Task 0.1 evidence and remain a release gate.
