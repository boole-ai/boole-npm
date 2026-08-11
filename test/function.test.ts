import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocalFunction } from "../src/function.js";
import { ModelResolver } from "../src/models/resolver.js";
import type { InferenceEngine } from "../src/engine/types.js";

describe("LocalFunction", () => {
  let mockEngine: InferenceEngine;
  let mockResolver: ModelResolver;

  beforeEach(() => {
    mockEngine = {
      loadModel: vi.fn().mockResolvedValue(undefined),
      unloadModel: vi.fn().mockResolvedValue(undefined),
      generate: vi.fn().mockResolvedValue({
        text: "Generated text",
        tokensGenerated: 10,
        stopReason: "end_of_text",
      }),
      generateStream: vi.fn().mockImplementation(async function* () {
        yield { text: "chunk1", isComplete: false };
        yield { text: "chunk2", isComplete: true, tokensGenerated: 2 };
      }),
      getModelInfo: vi.fn().mockReturnValue(null),
      isLoaded: vi.fn().mockReturnValue(false),
    };

    mockResolver = {
      resolve: vi.fn().mockResolvedValue("/path/to/model.gguf"),
    } as unknown as ModelResolver;
  });

  it("should create a function with config", () => {
    const fn = new LocalFunction(
      { model: "test-model", quant: "Q4_K_M" },
      async (_ctx, input: string) => input,
      mockResolver,
      mockEngine
    );
    expect(fn).toBeDefined();
  });

  it("should load model on first call", async () => {
    const fn = new LocalFunction(
      { model: "test-model", quant: "Q4_K_M" },
      async (ctx, input: string) => {
        return ctx.llm.generate(input);
      },
      mockResolver,
      mockEngine
    );

    mockEngine.isLoaded = vi.fn().mockReturnValue(false);
    await fn.call("test input");

    expect(mockResolver.resolve).toHaveBeenCalledWith("test-model:Q4_K_M");
    expect(mockEngine.loadModel).toHaveBeenCalledWith("/path/to/model.gguf");
  });

  it("should not reload model if already loaded", async () => {
    const fn = new LocalFunction(
      { model: "test-model" },
      async (ctx, input: string) => {
        return ctx.llm.generate(input);
      },
      mockResolver,
      mockEngine
    );

    mockEngine.isLoaded = vi.fn().mockReturnValue(true);
    await fn.call("test input");

    expect(mockEngine.loadModel).not.toHaveBeenCalled();
  });

  it("should provide generate method in context", async () => {
    const fn = new LocalFunction(
      { model: "test-model" },
      async (ctx, input: string) => {
        const result = await ctx.llm.generate(input);
        return result.toUpperCase();
      },
      mockResolver,
      mockEngine
    );

    mockEngine.isLoaded = vi.fn().mockReturnValue(true);
    const result = await fn.call("test");

    expect(mockEngine.generate).toHaveBeenCalledWith("test", {
      temperature: undefined,
      topP: undefined,
      maxTokens: undefined,
    });
    expect(result).toBe("GENERATED TEXT");
  });

  it("should unload model", async () => {
    const fn = new LocalFunction(
      { model: "test-model" },
      async (_ctx, input: string) => input,
      mockResolver,
      mockEngine
    );

    await fn.unload();
    expect(mockEngine.unloadModel).toHaveBeenCalled();
  });
});
