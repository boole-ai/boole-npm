# Boole

**Deploy and run AI models locally and at the edge.**
TypeScript SDK for running GGUF models on your own hardware via llama.cpp — no cloud required.

[![npm version](https://img.shields.io/npm/v/boole-ai.svg)](https://www.npmjs.com/package/boole-ai)
[![license](https://img.shields.io/npm/l/boole-ai.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/boole-ai.svg)](package.json)

```bash
npm install boole-ai
```

---

## Why Boole

Most inference SDKs route every call to the cloud. Boole lets you **deploy models to your edge infrastructure or local hardware** and run inference where your data lives — no round-trip to a remote API, no metered billing for work your own machines can handle.

- **Deploy once, run anywhere** — models stay on your edge servers, laptops, or workstations; no cloud dependency after initial download.
- **~10x cheaper** — no per-token metering or GPU-second billing for local workloads.
- **No cold starts** — models load once into a long-lived process, not a fresh container on every request.
- **Private by default** — prompts, context, and outputs never leave your infrastructure.
- **Familiar shape** — `App`, `Function`, and `Sandbox` primitives mirror serverless inference SDKs, but run locally.
- **Burst when you need to** — for models too large for local hardware, the same function can hand off to remote compute (opt-in, roadmap).

## Quickstart

```ts
import { App } from "boole-ai";

const app = new App({ name: "my-app" });

const generate = app.function(
  { model: "TheBloke/Mistral-7B-Instruct-v0.2-GGUF", quant: "Q4_K_M" },
  async (ctx, prompt: string) => ctx.llm.generate(prompt),
);

const result = await generate.call("Write a haiku about GPUs");
console.log(result);
```

The first call downloads and caches the GGUF weights to `~/.boole/models`; every call
after that loads from disk and runs entirely on your machine.

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

## Platform support

Boole uses native bindings (via `node-llama-cpp`) to talk to llama.cpp directly, with
GPU offload where available.

| Platform | CPU | GPU acceleration |
|---|---|---|
| macOS (Apple Silicon) | ✅ | ✅ Metal |
| macOS (Intel) | ✅ | — |
| Linux (x64/arm64) | ✅ | ✅ CUDA / Vulkan |
| Windows (x64) | ✅ | ✅ CUDA / Vulkan |

Prebuilt binaries are used where available; unsupported platform/architecture combinations
fall back to compiling from source on install.

## Configuration

```ts
import { Client } from "boole-ai";

const client = new Client({
  modelCacheDir: "~/.boole/models", // where GGUF files are stored
  defaultBackend: "llama-cpp",      // inference backend
});
```

## Roadmap

- [x] Local inference via llama.cpp / GGUF
- [x] `App` / `Function` / `Sandbox` primitives
- [ ] `RemoteBurst` — opt-in remote fallback for oversized models / scaled workloads
- [ ] Structured output / grammar-constrained generation helpers
- [ ] Bun runtime support

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for local dev setup
(`pnpm install`, `pnpm test`, `pnpm build`).

---

**MIT © Jordan Plows**
