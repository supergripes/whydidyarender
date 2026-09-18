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
- No backend: all data is mock, generated client-side

## Getting started

```bash
npm install
npm run dev
```
