import { ModelResolver, ModelResolverConfig } from "./models/resolver.js";
import { InferenceEngine } from "./engine/types.js";
import { NotImplementedError } from "./errors.js";

export interface ClientConfig {
  modelCache?: ModelResolverConfig;
  remoteAuthToken?: string;
}

export class Client {
  private modelResolver: ModelResolver;
  private remoteAuthToken?: string;

  constructor(config: ClientConfig = {}) {
    this.modelResolver = new ModelResolver(config.modelCache);
    this.remoteAuthToken = config.remoteAuthToken;
  }

  createEngine(): InferenceEngine {
    throw new NotImplementedError(
      "No default inference engine available. Extend Client and override createEngine() with your own implementation."
    );
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
