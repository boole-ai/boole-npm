import { ModelResolver, ModelResolverConfig } from "./models/resolver.js";
import { LlamaCppEngine, LlamaCppEngineConfig } from "./engine/llama-cpp-engine.js";
import { InferenceEngine } from "./engine/types.js";

export interface ClientConfig {
  modelCache?: ModelResolverConfig;
  engine?: LlamaCppEngineConfig;
  remoteAuthToken?: string;
}

export class Client {
  private modelResolver: ModelResolver;
  private defaultEngineConfig: LlamaCppEngineConfig;
  private remoteAuthToken?: string;

  constructor(config: ClientConfig = {}) {
    this.modelResolver = new ModelResolver(config.modelCache);
    this.defaultEngineConfig = config.engine ?? {};
    this.remoteAuthToken = config.remoteAuthToken;
  }

  createEngine(): InferenceEngine {
    return new LlamaCppEngine(this.defaultEngineConfig);
  }

  getModelResolver(): ModelResolver {
    return this.modelResolver;
  }

  getRemoteAuthToken(): string | undefined {
    return this.remoteAuthToken;
  }

  setRemoteAuthToken(token: string): void {
    this.remoteAuthToken = token;
  }
}
