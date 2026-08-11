import { App } from "../src/index.js";

async function main() {
  const app = new App({ name: "example-app" });

  const generate = app.function(
    {
      model: "TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
      quant: "mistral-7b-instruct-v0.2.Q4_K_M.gguf",
      gpuLayers: 32,
    },
    async (ctx, input: string) => {
      console.log("Generating response for:", input);
      const response = await ctx.llm.generate(input, {
        temperature: 0.7,
        maxTokens: 256,
      });
      return response;
    }
  );

  try {
    const result = await generate.call("Write a haiku about GPUs");
    console.log("\nResult:", result);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await app.cleanup();
  }
}

main().catch(console.error);
