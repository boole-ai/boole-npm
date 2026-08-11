import { describe, it, expect } from "vitest";
import { LlamaCppEngine } from "../src/engine/llama-cpp-engine.js";

describe("LlamaCppEngine", () => {
  it("should create an engine with default config", () => {
    const engine = new LlamaCppEngine();
    expect(engine).toBeDefined();
    expect(engine.isLoaded()).toBe(false);
  });

  it("should create an engine with custom config", () => {
    const engine = new LlamaCppEngine({
      gpuLayers: 32,
      contextSize: 2048,
      batchSize: 256,
    });
    expect(engine).toBeDefined();
    expect(engine.isLoaded()).toBe(false);
  });

  it("should return null model info when not loaded", () => {
    const engine = new LlamaCppEngine();
    expect(engine.getModelInfo()).toBeNull();
  });

  it("should report not loaded initially", () => {
    const engine = new LlamaCppEngine();
    expect(engine.isLoaded()).toBe(false);
  });
});
