import { describe, it, expect } from "vitest";
import {
  LocalforgeError,
  ModelNotFoundError,
  ModelDownloadError,
  InferenceError,
  SandboxTimeoutError,
  SandboxExecutionError,
  NotImplementedError,
  ConfigurationError,
} from "../src/errors.js";

describe("Errors", () => {
  it("should create ModelNotFoundError", () => {
    const error = new ModelNotFoundError("/path/to/model");
    expect(error).toBeInstanceOf(LocalforgeError);
    expect(error.message).toContain("/path/to/model");
    expect(error.name).toBe("ModelNotFoundError");
  });

  it("should create ModelDownloadError", () => {
    const error = new ModelDownloadError("model-name", "network error");
    expect(error).toBeInstanceOf(LocalforgeError);
    expect(error.message).toContain("model-name");
    expect(error.message).toContain("network error");
  });

  it("should create InferenceError", () => {
    const error = new InferenceError("generation failed");
    expect(error).toBeInstanceOf(LocalforgeError);
    expect(error.message).toContain("generation failed");
  });

  it("should create SandboxTimeoutError", () => {
    const error = new SandboxTimeoutError(5000);
    expect(error).toBeInstanceOf(LocalforgeError);
    expect(error.message).toContain("5000");
  });

  it("should create SandboxExecutionError", () => {
    const error = new SandboxExecutionError("command failed", 1);
    expect(error).toBeInstanceOf(LocalforgeError);
    expect(error.message).toContain("command failed");
    expect(error.message).toContain("exit code 1");
  });

  it("should create NotImplementedError", () => {
    const error = new NotImplementedError("remote burst");
    expect(error).toBeInstanceOf(LocalforgeError);
    expect(error.message).toContain("remote burst");
  });

  it("should create ConfigurationError", () => {
    const error = new ConfigurationError("invalid config");
    expect(error).toBeInstanceOf(LocalforgeError);
    expect(error.message).toContain("invalid config");
  });
});
