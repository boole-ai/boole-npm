# Boole

**Inference SDK for edge AI deployment.**

A TypeScript framework for building local-first LLM applications with a familiar App/Function/Sandbox API. Bring your own inference engine.

[![npm version](https://img.shields.io/npm/v/boole-ai.svg)](https://www.npmjs.com/package/boole-ai)
[![license](https://img.shields.io/npm/l/boole-ai.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/boole-ai.svg)](package.json)

```bash
npm install boole-ai
```

---

## Why Boole

- **Familiar shape** — `App`, `Function`, and `Sandbox` primitives that mirror serverless inference SDKs
- **Bring your own engine** — Abstract inference interface lets you plug in any backend
- **Type-safe** — Full TypeScript support with type inference
- **Local-first** — Designed for edge deployment and on-device inference
- **Flexible** — Supports both local and remote inference patterns

## Installation

```bash
npm install @boole/boole-ai
```

## Usage

Boole provides the framework; you provide the inference engine.

### 1. Implement InferenceEngine

```ts
import { InferenceEngine, GenerateOptions, GenerateResult } from "@boole/boole-ai";

class MyEngine implements InferenceEngine {
  async loadModel(modelPath: string): Promise<void> {
    // Load your model
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult> {
    // Generate text
    return {
      text: "Generated response",
      tokensGenerated: 10,
      stopReason: "end_of_text",
    };
  }

  async *generateStream(prompt: string, options?: GenerateOptions) {
    // Stream tokens
    yield { text: "token", isComplete: false, tokensGenerated: 1 };
  }

  // ... other required methods
}
```

### 2. Extend Client

```ts
import { Client } from "@boole/boole-ai";

class MyClient extends Client {
  createEngine() {
    return new MyEngine();
  }
}
```

### 3. Build Your App

```ts
import { App } from "@boole/boole-ai";

const client = new MyClient();
const app = new App({ name: "my-app", client });

const generate = app.function(
  { model: "my-model" },
  async (ctx, prompt: string) => ctx.llm.generate(prompt)
);

const result = await generate.call("Hello!");
```

## Core concepts

| Primitive | What it does |
|---|---|
| `App` | Top-level container that groups functions and shared config. |
| `Function` | A typed, callable unit of inference work, bound to a specific model. |
| `Sandbox` | An isolated local execution context for running arbitrary code with resource limits (timeout, memory cap). |
| `Client` | SDK entry point — model cache directory, default backend, auth for future remote mode. |
| `RemoteBurst` *(opt-in)* | Routes a `Function` call to remote compute when local hardware can't handle it. |

### Streaming generation

```ts
for await (const token of ctx.llm.stream(prompt)) {
  process.stdout.write(token);
}
```

### Running untrusted code in a Sandbox

```ts
const sandbox = app.sandbox({ timeoutMs: 5000, memoryLimitMb: 512 });
const { stdout } = await sandbox.exec("node", ["-e", "console.log(1 + 1)"]);
```

## Architecture

Boole provides:
- **Interfaces** — `InferenceEngine` for plugging in your backend
- **Primitives** — `App`, `Function`, `Sandbox` for structuring inference workloads
- **Abstractions** — `ModelResolver` for model discovery and caching

You provide:
- **Engine implementation** — Connect to llama.cpp, Workers AI, Replicate, OpenAI, etc.
- **Model handling** — How models are loaded, cached, and managed

## API Reference

### InferenceEngine Interface

```ts
interface InferenceEngine {
  loadModel(modelPath: string): Promise<void>;
  unloadModel(): Promise<void>;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  generateStream(prompt: string, options?: GenerateOptions): AsyncGenerator<StreamChunk>;
  getModelInfo(): ModelInfo | null;
  isLoaded(): boolean;
}
```

### Types

```ts
interface GenerateOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  repeatPenalty?: number;
}

interface GenerateResult {
  text: string;
  tokensGenerated: number;
  stopReason: "end_of_text" | "max_tokens" | "stop_sequence";
}

interface StreamChunk {
  text: string;
  isComplete: boolean;
  tokensGenerated: number;
  stopReason?: "end_of_text" | "max_tokens" | "stop_sequence";
}
```

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for local dev setup
(`pnpm install`, `pnpm test`, `pnpm build`).

---

**MIT © Jordan Plows**
