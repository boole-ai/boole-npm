import { InferenceEngine } from "./engine/types.js";
import { ModelResolver } from "./models/resolver.js";
import { InferenceError } from "./errors.js";

export interface FunctionContext {
  llm: {
    generate: (
      prompt: string,
      options?: {
        temperature?: number;
        topP?: number;
        maxTokens?: number;
      }
    ) => Promise<string>;
    generateStream: (
      prompt: string,
      options?: {
        temperature?: number;
        topP?: number;
        maxTokens?: number;
      }
    ) => AsyncGenerator<string, void, unknown>;
  };
}

export type FunctionHandler<TInput = unknown, TOutput = unknown> = (
  ctx: FunctionContext,
  input: TInput
) => Promise<TOutput>;

export interface LocalFunctionConfig {
  model: string;
  quant?: string;
  gpuLayers?: number;
  contextSize?: number;
}

export class LocalFunction<TInput = unknown, TOutput = unknown> {
  private config: LocalFunctionConfig;
  private handler: FunctionHandler<TInput, TOutput>;
  private engine: InferenceEngine | null = null;
  private modelResolver: ModelResolver;

  constructor(
    config: LocalFunctionConfig,
    handler: FunctionHandler<TInput, TOutput>,
    modelResolver: ModelResolver,
    engine: InferenceEngine
  ) {
    this.config = config;
    this.handler = handler;
    this.modelResolver = modelResolver;
    this.engine = engine;
  }

  async call(input: TInput): Promise<TOutput> {
    if (!this.engine) {
      throw new InferenceError("Engine not initialized");
    }

    if (!this.engine.isLoaded()) {
      const modelSpec = this.config.quant
        ? `${this.config.model}:${this.config.quant}`
        : this.config.model;
      const modelPath = await this.modelResolver.resolve(modelSpec);
      await this.engine.loadModel(modelPath);
    }

    const ctx = this.createContext();
    return this.handler(ctx, input);
  }

  private createContext(): FunctionContext {
    if (!this.engine) {
      throw new InferenceError("Engine not initialized");
    }

    const engine = this.engine;

    return {
      llm: {
        generate: async (prompt, options = {}) => {
          const result = await engine.generate(prompt, {
            temperature: options.temperature,
            topP: options.topP,
            maxTokens: options.maxTokens,
          });
          return result.text;
        },
        generateStream: async function* (prompt, options = {}) {
          for await (const chunk of engine.generateStream(prompt, {
            temperature: options.temperature,
            topP: options.topP,
            maxTokens: options.maxTokens,
          })) {
            yield chunk.text;
          }
        },
      },
    };
  }

  async unload(): Promise<void> {
    if (this.engine) {
      await this.engine.unloadModel();
    }
  }
}
