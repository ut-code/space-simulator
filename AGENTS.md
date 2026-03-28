AGENTS Guide for repo-wide agents

Purpose
- This file instructs automated coding agents (and humans) how to build, lint, test and edit code in this repository.
- Follow the conventions below to keep changes consistent and to avoid accidental style/behavior regressions.

1) Quick commands (run from repository root)
- Install dependencies: `npm install`
- Start dev server: `npm run dev` (Vite)
- Build production bundle: `npm run build` (runs `tsc -b && vite build`)
- Preview build: `npm run preview`
- Run all tests: `npm run test` (runs `vitest`)
- Lint & format (project): `npm run check` (runs `npx @biomejs/biome check --write`)

Run a single test
- Run a single test file: `npx vitest src/path/to/file.test.ts` or `npx vitest src/path/to/file.spec.ts`
- Run a single test by name (pattern): `npx vitest -t "pattern"`
  - Example: `npx vitest -t "renders planet mesh"` will run tests whose name matches that string/regex.
- Run a single test and watch: `npx vitest --watch -t "pattern"`

Vitest notes
- The project uses `vitest` and `happy-dom` (see devDependencies). If tests touch DOM, ensure `happy-dom` is available in the test environment.
- Use `npx vitest run --coverage` to produce coverage reports.

2) Formatting & linting
- The repository uses Biome (@biomejs/biome) as the formatter/linter. Run `npm run check` to apply fixes and check rules.
- Biome configuration (repo root): `biome.json`
  - Formatter: tab indentation (`indentStyle: "tab"`)
  - JS quote style: double quotes for JavaScript files
  - Linter: `recommended` rules enabled
  - Assist: `organizeImports` is enabled and will be applied by the Biome assist actions
- Pre-commit: `lefthook.yml` runs Biome against staged files. Agents must not bypass hooks; prefer to keep commits that pass `npm run check`.

3) Import conventions
- Use absolute app aliases where present: `@/...` for project top-level imports (examples already in codebase: `@/types/planet`).
- Prefer grouped imports with external libs first, a blank line, then internal imports.
  - Example order:
    1. Node / built-in imports (rare in browser app)
    2. External packages (react, three, etc.)
    3. Absolute/internal imports ("@/…" or "src/…")
    4. Relative imports ("./", "../")
- Keep import lists organized. Let Biome organize imports automatically if unsure.
- Prefer named exports for library code. Default exports are allowed for single-component files but prefer named for utilities.

4) Files, components and naming
- React components: use PascalCase filenames and PascalCase export names (e.g., `PlanetMesh.tsx`, export `function PlanetMesh()` or `export const PlanetMesh = ...`).
- Hooks: use `useXxx` naming and camelCase filenames (e.g., `useLevaControls.ts`).
- Utility modules and plain functions: use camelCase filenames or kebab-case where appropriate; exports should be named and descriptive.
- Types and interfaces: prefer `type` aliases for object shape declarations in this codebase (project has converted many `interface` -> `type`). Use `type` for unions, tuples, mapped types; use `interface` only where declaration merging or extension is intentional.

5) TypeScript usage
- Keep TypeScript types strict and explicit for public API surfaces (component props, exported functions, engine configs).
- Use `export type` for exported shapes and `type` for internal shapes unless you need `interface` semantics.
- Prefer `ReturnType<T['method']>` sparingly — prefer exported, named snapshot/types where possible for clarity.
- Avoid `any`. If you must use it, leave a short `// TODO` comment and create a ticket to improve the type.

6) Formatting specifics
- Tabs for indentation (Biome enforces this).
- Double quotes for JavaScript; TypeScript files should follow the same style where applicable.
- Keep lines reasonably short; wrap long expressions over multiple lines with readable indentation.
- Use Biome auto-fix before committing: `npm run check` and stage the fixed files.

7) Error handling & logging
- Fail fast in engine code, but avoid throwing unhandled exceptions to the top-level UI.
  - Physics/engine code should validate inputs and use `console.warn` for recoverable or invalid data (this pattern is present in PhysicsEngine).
  - Use `throw` only for unrecoverable errors during initialization or when invariants are violated and the caller must handle it.
- Avoid excessive console.log in production code. Use `console.debug`/`console.info` for verbose developer logs and remove or gate them behind a debug flag in production-critical code.
- When catching errors, prefer to:
  - log a concise message and details (`console.error('Failed to load X', err)`),
  - surface user-friendly messages to UI layers (not raw exceptions),
  - preserve original error where useful (wrap only when adding context).

8) Testing & test style
- Tests use `vitest`. Keep tests small and deterministic. Prefer unit tests for physics/utilities and lightweight integration tests for components.
- Use `happy-dom` for DOM-like tests. Mock three.js/WebGL-specific runtime where needed, or isolate logic from rendering.
- Name tests clearly: `describe('PlanetMesh')`, `it('renders texture and radius')`.
- Use `beforeEach` / `afterEach` to reset global state and registries to avoid test pollution.

9) Git workflow & commits
- Commit messages: short present-tense summary. Agents should stage only the files they change and avoid amending unrelated user changes.
- Pre-commit runs Biome on staged files (via lefthook). Ensure `npm run check` passes locally before pushing.

10) Code review expectations for agents
- Small, focused PRs: keep changes minimal and well-described.
- Include unit tests for new logic and update types as necessary.
- Run `npm run check` and `npm run test` locally before requesting review.

11) Cursor / Copilot rules
- There are no repository-level Cursor rules (no `.cursor/rules/` or `.cursorrules` files found).
- There are no GitHub Copilot instructions present (`.github/copilot-instructions.md` not found).
- If you add such rules, include them here and ensure agents obey them.

12) Miscellaneous guidance
- Use the existing code patterns as a guide (e.g., PhysicsEngine uses explicit vector reuse to reduce GC; follow similar performance-sensitive patterns there).
- Where changes touch rendering or physics timing, test in the running dev server to ensure behavior matches expectations.
- When adding new dependencies, prefer lightweight, well-maintained packages and add them to `package.json` devDependencies/devDependencies appropriately.

Contact / follow-up
- If uncertain, open a small PR and request a human review rather than making wide-reaching changes.

— End of AGENTS.md —
