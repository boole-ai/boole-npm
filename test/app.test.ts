import { describe, it, expect, vi } from "vitest";
import { App, Client } from "../src/index.js";
import type { InferenceEngine } from "../src/engine/types.js";

describe("App", () => {
  it("should create an app with a name", () => {
    const app = new App({ name: "test-app" });
    expect(app.getName()).toBe("test-app");
  });

  it("should create an app with a custom client", () => {
    const client = new Client();
    const app = new App({ name: "test-app", client });
    expect(app.getClient()).toBe(client);
  });

  it("should create a sandbox", () => {
    const app = new App({ name: "test-app" });
    const sandbox = app.sandbox();
    expect(sandbox).toBeDefined();
    expect(sandbox.getConfig()).toHaveProperty("timeout");
  });

  it("should create a remote burst instance", () => {
    const app = new App({ name: "test-app" });
    const burst = app.remoteBurst();
    expect(burst).toBeDefined();
    expect(burst.isConfigured()).toBe(false);
  });

  it("should create a local function", () => {
    // Mock the client's createEngine to avoid NotImplementedError
    const mockEngine: InferenceEngine = {
      loadModel: vi.fn().mockResolvedValue(undefined),
      unloadModel: vi.fn().mockResolvedValue(undefined),
      generate: vi.fn(),
      generateStream: vi.fn(),
      getModelInfo: vi.fn().mockReturnValue(null),
      isLoaded: vi.fn().mockReturnValue(false),
    };

    const client = new Client();
    vi.spyOn(client, "createEngine").mockReturnValue(mockEngine);

    const app = new App({ name: "test-app", client });
    const fn = app.function(
      {
        model: "test-model",
        quant: "Q4_K_M",
      },
      async (ctx, input: string) => {
        return input.toUpperCase();
      }
    );
    expect(fn).toBeDefined();
  });

  it("should clean up resources", async () => {
    const app = new App({ name: "test-app" });
    app.sandbox();
    app.remoteBurst();
    await expect(app.cleanup()).resolves.not.toThrow();
  });
});
