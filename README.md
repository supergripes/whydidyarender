# whydidyarender

A small dashboard purpose-built to re-render more than it should, plus a
real-time overlay (via React's Profiler API) that flashes every component
as it re-renders, so you can *see* the cascade instead of guessing at it.

Also compares the same UI with and without React Compiler enabled, side
by side, so you can see how many of those re-renders it eliminates for
free.

## Stack

- Vite + React 19 + TypeScript
- React Compiler (`babel-plugin-react-compiler`)
- Tailwind CSS v4
- Vitest + React Testing Library
- No backend: all data is mock, generated client-side

## Getting started

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Covers the deterministic mock data generator, the Profiler-based render
tracking bus (mount vs. update events, per-instance ids, unsubscribe),
the 10-second rolling render counter and the flash overlay's lifecycle
(both driven off a mocked event bus so timing is fully controlled), and
the dashboard's own filtering/selection behavior. Deliberately does not
try to assert on render *counts* through the actual UI (with vs. without
the compiler): that's exactly what `compare.html` is for, and it would
make the tests fragile without adding real confidence.

## React Compiler comparison

React Compiler is a build-time transform, so it can't be flipped on and
off while the app is running. Instead, there are two separate builds:

```bash
npm run build:compare
npm run preview
```

This builds the dashboard twice, once with the compiler applied and once
without, and serves both side by side (each in its own iframe) via
`compare.html`. Turn on the render overlay in both panes and interact
with one side, then the other, to see the difference.

For local iteration, `npm run dev:uncompiled` runs the dev server with
the compiler turned off (`npm run dev` has it on, same as `npm run
build`).

## License

MIT
