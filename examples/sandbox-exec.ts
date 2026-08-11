import { App } from "../src/index.js";

async function main() {
  const app = new App({ name: "sandbox-example" });

  const sandbox = app.sandbox({
    timeout: 10000,
    workingDir: process.cwd(),
  });

  try {
    console.log("Executing echo command...");
    const echoResult = await sandbox.exec("echo", ["Hello from sandbox!"]);
    console.log("stdout:", echoResult.stdout);
    console.log("exit code:", echoResult.exitCode);

    console.log("\nExecuting Node.js code...");
    const nodeResult = await sandbox.exec("node", [
      "-e",
      "console.log('Current time:', new Date().toISOString())",
    ]);
    console.log("stdout:", nodeResult.stdout);

    console.log("\nListing current directory...");
    const lsResult = await sandbox.exec("ls", ["-la"]);
    console.log("stdout:", lsResult.stdout.split("\n").slice(0, 5).join("\n"));
    console.log("...(truncated)");
  } catch (error) {
    console.error("Sandbox execution error:", error);
  } finally {
    await app.cleanup();
  }
}

main().catch(console.error);
