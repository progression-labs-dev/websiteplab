---
title: "Next.js build fails with onnxruntime-web import.meta error"
category: build-errors
tags: [nextjs, webpack, onnxruntime, huggingface, transformers, terser, esm]
module: next.config.js
symptom: "Build fails: 'import.meta' cannot be used outside of module code (from Terser on ort.bundle.min.mjs)"
root_cause: "onnxruntime-web ships .mjs files with import.meta.url but webpack treats node_modules as CJS by default"
date: 2026-02-17
---

## Problem

When adding `@huggingface/transformers` to a Next.js project, production builds fail with:

```
static/media/ort.bundle.min.135f155b.mjs from Terser
  x 'import.meta' cannot be used outside of module code.
```

TypeScript compilation (`tsc --noEmit`) and dev mode both work fine — only production `npm run build` fails.

## Investigation

The `@huggingface/transformers` package depends on `onnxruntime-web`, which ships a pre-minified bundle `ort.bundle.min.mjs`. This file uses `import.meta.url` for WASM file loading. During production builds, Next.js's webpack pipeline passes this through Terser for minification. Terser defaults to treating files as CommonJS scripts, which don't support `import.meta`.

## Root Cause

Webpack's default module type for files in `node_modules` is `javascript/auto` (CommonJS-compatible). The `.mjs` extension should indicate ESM, but webpack doesn't automatically apply this for files inside `node_modules`. Terser then parses the file in script mode and rejects `import.meta`.

## Solution

Add a webpack rule in `next.config.js` to tell webpack that `.mjs` files in `onnxruntime-web` are ES modules:

```js
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /onnxruntime-web/,
      type: 'javascript/esm',
    });
  }
  return config;
},
```

This makes Terser parse the file in module mode, which supports `import.meta`.

## Prevention

- When adding ML/WASM libraries to Next.js, always test `npm run build` early
- `@huggingface/transformers`, `onnxruntime-web`, `@xenova/transformers` all need this fix
- Also add `onnxruntime-node` to `serverComponentsExternalPackages` to prevent server-side bundling of native binaries

## Test Cases

1. `npm run build` should exit 0
2. `npx tsc --noEmit` should pass (sanity check)
3. The mosaic tool should load SlimSAM model in browser without errors
