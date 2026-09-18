# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`whydidyarender` is a small portfolio piece, not a product. A dashboard
engineered to re-render more than it should, a real-time overlay (via
React's Profiler API) that flashes every component as it re-renders, a
live "renders in the last 10s" counter, and a side-by-side comparison of
the same app built with and without React Compiler. Keep changes minimal
and focused: flag anything that would meaningfully grow the scope instead
of just doing it.

## Architecture

- [src/data/mockData.ts](src/data/mockData.ts): mock rows from a seeded
  PRNG (`mulberry32`), so the dataset is stable across reloads.
- [src/components/Dashboard.tsx](src/components/Dashboard.tsx): the
  example dashboard. `TableRow` is wrapped in `React.memo`, but
  `handleToggleSelect` in `Dashboard` is **deliberately not** wrapped in
  `useCallback`, which is exactly what breaks the memo and cascades
  re-renders on every keystroke/tick/selection. Don't "fix" it by adding
  `useCallback`; that's the whole point of the demo. (React Compiler
  papers over it automatically, which is itself part of the point.)
- [src/hooks/useRenderTracking.ts](src/hooks/useRenderTracking.ts): thin
  wrapper around `<Profiler onRender>`. Every tracked component calls
  `useRenderTracking(id)`, attaches the returned `ref` to its root DOM
  node, and wraps its own return value in `<Profiler id={id}
  onRender={onRender}>`. Each instance needs a unique id (e.g.
  `` `TableRow:${row.id}` ``) since React aggregates commits per id, not
  per component instance. This file also owns the module-level pub/sub
  event bus (`subscribeToRenderEvents`) that both `RenderOverlay` and
  `RenderCounter` consume. It's always active, independent of whether the
  overlay is visually toggled on.
- [src/components/RenderOverlay.tsx](src/components/RenderOverlay.tsx):
  subscribes to the event bus when `enabled`, flashes a colored box
  (green for mount, red for update) over the real DOM position of
  whatever just re-rendered, fading out over 500ms.
- [src/components/RenderCounter.tsx](src/components/RenderCounter.tsx):
  rolling 10-second count of render events. Always subscribed, regardless
  of the overlay toggle.
- [vite.config.ts](vite.config.ts): reads `WHYDIDYARENDER_COMPILER`
  (`on`/`off`, default on) to decide whether to apply
  `babel-plugin-react-compiler`, and exposes that as
  `__REACT_COMPILER_ENABLED__` for the UI badge. Also aliases
  `react-dom/client` to `react-dom/profiling` for production builds only:
  React strips the Profiler's `onRender` callback from the default
  production `react-dom` bundle, so without this alias the render
  counter and overlay silently stop working in `vite build` / `vite
  preview` while looking fine in `vite dev`. Easy to forget, easy to
  accidentally revert. Don't.
- [compare.html](compare.html) and
  [scripts/build-compare.mjs](scripts/build-compare.mjs): static
  two-iframe comparison page (`/compiled/` vs `/uncompiled/`), built by
  `npm run build:compare`. React Compiler is a build-time transform, so
  there's no live runtime toggle; this is the two-separate-builds
  fallback instead.
- Tests live next to what they cover (`*.test.ts(x)`), run via Vitest
  (config lives in `vite.config.ts`'s `test` field, not a separate file).
  `RenderCounter.test.tsx` and `RenderOverlay.test.tsx` both
  `vi.mock("../hooks/useRenderTracking")` to replace
  `subscribeToRenderEvents` with a controllable fake bus, so render-event
  timing is asserted deterministically instead of depending on real
  Profiler/DOM timing. `useRenderTracking.test.tsx` and
  `Dashboard.test.tsx` exercise the real thing. Deliberately no test
  asserts on render *counts* through the UI with vs. without the
  compiler; `compare.html` covers that, and turning it into an assertion
  would just make the suite fragile.

## Conventions

- Commit messages follow Conventional Commits (`type: description`).
- Only commit or push when explicitly asked.
- No em-dashes anywhere: code, comments, docs, commit messages. Use a
  period, comma, or colon instead.
- No new dependencies beyond what's already installed
  (`react`/`react-dom`, `vite`, `@vitejs/plugin-react`, `tailwindcss`,
  `@tailwindcss/vite`, `babel-plugin-react-compiler`, `typescript`,
  `vitest`, `@testing-library/*`, `jsdom`) without asking first.
- TypeScript is pinned to the 5.9.x line rather than the newer 7.x native
  compiler, and `@vitejs/plugin-react` to 5.x rather than 6.x. The 6.x
  line dropped the classic `babel: { plugins }` option that
  `babel-plugin-react-compiler` needs, in favor of an oxc/rolldown-based
  transform. Don't upgrade either without checking that compatibility
  first.

## Git workflow

- `main` is ruleset-protected on GitHub: PR required (0 approvals, since
  this is a solo project), linear history, no direct pushes, no
  force-pushes, no deletions.
- `develop` is the working branch: no PR required, force-push allowed
  (for `amend`/`rebase`), just protected from accidental deletion.

## Build & test

```bash
npm install
npm run dev              # compiler on (default)
npm run dev:uncompiled   # compiler off, for local comparison
npm run build             # single production build (compiler on)
npm run build:compare     # builds both variants + compare.html into dist/
npm run preview           # serves dist/
npm run test              # run the test suite once
npm run test:watch        # watch mode
```
