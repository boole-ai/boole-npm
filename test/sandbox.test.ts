import { describe, it, expect } from "vitest";
import { Sandbox } from "../src/sandbox.js";

describe("Sandbox", () => {
  it("should create a sandbox with default config", () => {
    const sandbox = new Sandbox();
    const config = sandbox.getConfig();
    expect(config.timeout).toBe(30000);
    expect(config.workingDir).toBeDefined();
  });

  it("should create a sandbox with custom config", () => {
    const sandbox = new Sandbox({
      timeout: 5000,
      workingDir: "/tmp",
      env: { TEST: "value" },
    });
    const config = sandbox.getConfig();
    expect(config.timeout).toBe(5000);
    expect(config.workingDir).toBe("/tmp");
    expect(config.env).toEqual({ TEST: "value" });
  });

  it("should execute a simple command", async () => {
    const sandbox = new Sandbox({ timeout: 5000 });
    const result = await sandbox.exec("echo", ["hello"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("hello");
    expect(result.timedOut).toBe(false);
  });

  it("should timeout long-running commands", async () => {
    const sandbox = new Sandbox({ timeout: 100 });
    await expect(
      sandbox.exec("sleep", ["10"])
    ).rejects.toThrow("exceeded timeout");
  });
});
