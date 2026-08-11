import { Client } from "./client.js";
import {
  LocalFunction,
  LocalFunctionConfig,
  FunctionHandler,
} from "./function.js";
import { Sandbox, SandboxConfig } from "./sandbox.js";
import { RemoteBurst, RemoteBurstConfig } from "./remote/burst.js";

export interface AppConfig {
  name: string;
  client?: Client;
}

export class App {
  private name: string;
  private client: Client;
  private functions: Map<string, LocalFunction<unknown, unknown>>;
  private sandboxes: Map<string, Sandbox>;

  constructor(config: AppConfig) {
    this.name = config.name;
    this.client = config.client ?? new Client();
    this.functions = new Map();
    this.sandboxes = new Map();
  }

  function<TInput = unknown, TOutput = unknown>(
    config: LocalFunctionConfig,
    handler: FunctionHandler<TInput, TOutput>
  ): LocalFunction<TInput, TOutput> {
    const engine = this.client.createEngine();
    const modelResolver = this.client.getModelResolver();

    const fn = new LocalFunction<TInput, TOutput>(
      config,
      handler,
      modelResolver,
      engine
    );

    return fn;
  }

  sandbox(config: SandboxConfig = {}): Sandbox {
    return new Sandbox(config);
  }

  remoteBurst(config: RemoteBurstConfig = {}): RemoteBurst {
    const remoteBurst = new RemoteBurst({
      ...config,
      authToken: config.authToken ?? this.client.getRemoteAuthToken(),
    });
    return remoteBurst;
  }

  getName(): string {
    return this.name;
  }

  getClient(): Client {
    return this.client;
  }

  async cleanup(): Promise<void> {
    await Promise.all(
      Array.from(this.functions.values()).map((fn) => fn.unload())
    );
    this.functions.clear();
    this.sandboxes.clear();
  }
}
