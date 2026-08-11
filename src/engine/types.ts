export interface SamplingParams {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  repeatPenalty?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface GenerateOptions extends SamplingParams {
  stream?: boolean;
}

export interface GenerateResult {
  text: string;
  tokensGenerated: number;
  stopReason?: "max_tokens" | "stop_sequence" | "end_of_text";
}

export interface StreamChunk {
  text: string;
  isComplete: boolean;
  tokensGenerated?: number;
  stopReason?: "max_tokens" | "stop_sequence" | "end_of_text";
}

export interface ModelInfo {
  path: string;
  contextSize: number;
  vocabSize: number;
  layersOffloadedToGpu?: number;
}

export interface InferenceEngine {
  loadModel(modelPath: string): Promise<void>;
  unloadModel(): Promise<void>;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  generateStream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<StreamChunk, void, unknown>;
  getModelInfo(): ModelInfo | null;
  isLoaded(): boolean;
}
