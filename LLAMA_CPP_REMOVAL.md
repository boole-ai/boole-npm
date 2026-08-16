# llama.cpp Removal Summary

## Overview

All llama.cpp dependencies and implementation have been removed from the codebase. Boole is now a pure TypeScript framework for building LLM applications with a "bring your own engine" architecture.

---

## What Was Removed

### Dependencies
- ✅ `node-llama-cpp` removed from `package.json`
- ✅ `node-llama-cpp` removed from tsup externals

### Source Files
- ✅ `src/engine/llama-cpp-engine.ts` — Deleted (~180 lines)
- ✅ References to `LlamaCppEngine` removed from exports

### Tests
- ✅ `test/engine.test.ts` — Removed (no longer applicable)
- ✅ `test/app.test.ts` — Updated to mock engine instead of using LlamaCppEngine

### Examples
- ✅ `examples/basic-generate.ts` — Removed (referenced GGUF models)
- ✅ `examples/sandbox-exec.ts` — Removed

### Documentation
- ✅ README updated to reflect "bring your own engine" architecture
- ✅ package.json description updated
- ✅ Removed all references to llama.cpp, GGUF, GPU acceleration

---

## What Remains

### Core Framework (Unchanged)
- ✅ `src/app.ts` — App primitive
- ✅ `src/function.ts` — Function primitive
- ✅ `src/sandbox.ts` — Sandbox primitive
- ✅ `src/remote/burst.ts` — Remote burst (stub)
- ✅ `src/models/resolver.ts` — Model resolver
- ✅ `src/engine/types.ts` — InferenceEngine interface
- ✅ `src/errors.ts` — Error classes

### Client (Modified)
- ✅ `src/client.ts` — Updated to throw `NotImplementedError` in `createEngine()`
- Users must extend `Client` and override `createEngine()` with their own implementation

### Tests (Updated)
- ✅ 22 tests passing (down from 26)
- ✅ All remaining tests use mocks instead of real engine

---

## New Architecture

### Before (With llama.cpp)
```
App → Client → LlamaCppEngine → node-llama-cpp → llama.cpp (native)
```

### After (Abstract)
```
App → Client (abstract) → ❌ NotImplementedError
                      ↓
                      Users extend and provide their own engine
```

### Usage Pattern

```typescript
// 1. Implement InferenceEngine
class MyEngine implements InferenceEngine {
  async loadModel(path: string) { /* ... */ }
  async generate(prompt: string, opts?) { /* ... */ }
  // ... other methods
}

// 2. Extend Client
class MyClient extends Client {
  createEngine() {
    return new MyEngine();
  }
}

// 3. Use with App
const client = new MyClient();
const app = new App({ name: "my-app", client });
```

---

## Bundle Size Impact

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| ESM | 13.47 KB | 9.34 KB | **-31%** |
| CJS | 13.90 KB | 9.73 KB | **-30%** |
| Types | 6.50 KB | 5.74 KB | **-12%** |

**Result:** Smaller, cleaner bundle with no native dependencies.

---

## Breaking Changes

### ❌ **BREAKING:** No default engine
```typescript
// Before: This worked out of the box
const app = new App({ name: "my-app" });
const fn = app.function({ model: "llama-2" }, handler);

// After: Throws NotImplementedError
// Must provide custom client with engine implementation
```

### ❌ **BREAKING:** LlamaCppEngine export removed
```typescript
// Before
import { LlamaCppEngine } from "@boole/boole-ai";

// After: Does not exist
// Import removed from index.ts
```

### ❌ **BREAKING:** LlamaCppEngineConfig removed
```typescript
// Before
interface ClientConfig {
  engine?: LlamaCppEngineConfig;
}

// After
interface ClientConfig {
  modelCache?: ModelResolverConfig;
  remoteAuthToken?: string;
}
```

---

## Migration Guide

### For Users Who Want llama.cpp

Create your own wrapper:

```typescript
// my-llama-engine.ts
import { getLlama } from "node-llama-cpp";
import { InferenceEngine, GenerateOptions, GenerateResult } from "@boole/boole-ai";

export class LlamaCppEngine implements InferenceEngine {
  private llama: any = null;
  private model: any = null;
  private context: any = null;

  async loadModel(modelPath: string): Promise<void> {
    this.llama = await getLlama();
    this.model = await this.llama.loadModel({ modelPath });
    this.context = await this.model.createContext();
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult> {
    // Implement using node-llama-cpp
    // ...
  }

  // ... other methods
}

// my-client.ts
import { Client } from "@boole/boole-ai";
import { LlamaCppEngine } from "./my-llama-engine.js";

export class LlamaClient extends Client {
  createEngine() {
    return new LlamaCppEngine();
  }
}
```

Then use it:

```typescript
import { App } from "@boole/boole-ai";
import { LlamaClient } from "./my-client.js";

const client = new LlamaClient();
const app = new App({ name: "my-app", client });
```

### For Users Who Want Other Backends

```typescript
// workers-ai-engine.ts
export class WorkersAIEngine implements InferenceEngine {
  async generate(prompt: string): Promise<GenerateResult> {
    const response = await fetch("https://api.cloudflare.com/...", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    return {
      text: data.result,
      tokensGenerated: 0,
      stopReason: "end_of_text",
    };
  }
  // ... other methods
}

// openai-engine.ts
export class OpenAIEngine implements InferenceEngine {
  async generate(prompt: string): Promise<GenerateResult> {
    // Call OpenAI API
  }
}
```

---

## Benefits of Removal

### ✅ **Flexibility**
- No longer tied to llama.cpp
- Users can choose any backend: llama.cpp, Workers AI, OpenAI, Replicate, etc.
- Mix and match engines per function

### ✅ **Smaller Bundle**
- 30% smaller bundle size
- No native dependencies
- Faster install times

### ✅ **Cleaner Architecture**
- Framework provides structure, not implementation
- Separation of concerns
- Easier to extend and customize

### ✅ **Runtime Agnostic**
- Works in Node.js, Deno, Bun
- Works in Cloudflare Workers (with appropriate engine)
- No native compilation issues

---

## Verification

### Build ✅
```bash
$ pnpm run build
# ESM: 9.34 KB, CJS: 9.73 KB, Types: 5.74 KB
```

### Tests ✅
```bash
$ pnpm run test
# 4 test files, 22 tests passing
```

### Lint ✅
```bash
$ pnpm run lint
# No errors
```

---

## Current State

The package is now a **pure TypeScript framework** with:
- ✅ Core primitives: `App`, `Function`, `Sandbox`
- ✅ Abstract interfaces: `InferenceEngine`, `ModelResolver`
- ✅ Type definitions for all APIs
- ✅ Error classes
- ❌ No default inference engine (by design)
- ❌ No native dependencies
- ❌ No examples (users bring their own engine)

---

## Next Steps

### Recommended
1. Document engine implementation patterns
2. Create example engines:
   - llama.cpp wrapper
   - Workers AI wrapper
   - OpenAI wrapper
3. Add "engines" directory with community-contributed engines
4. Update keywords in package.json

### Optional
5. Create `@boole/engine-*` packages for common backends
6. Add engine registry/marketplace
7. CLI tool for scaffolding custom engines

---

**Removal completed:** 2026-08-16  
**Bundle size reduction:** 31%  
**Breaking changes:** Major (no default engine)  
**Suggested version:** `0.7.0` or `1.0.0` (breaking changes)

🎉 **Boole is now a pure framework!**
