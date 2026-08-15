# Security

## Supply Chain Signals

This package has been designed to run AI models locally on your hardware. Due to the nature of local LLM inference with native bindings to llama.cpp, several supply-chain security signals are expected and legitimate:

### Network Access

**Why it's needed:**
- **Model downloads**: Users can download GGUF model files from HuggingFace and other model repositories
- **Prebuilt binaries**: Platform-specific native binaries for llama.cpp are downloaded during installation to avoid requiring local compilation
- **Dependency resolution**: Standard npm/pnpm package installation

**Packages involved:**
- `node-llama-cpp`: Core dependency that manages model downloads and native binary fetching
- `ipull`: HTTP download utility used by node-llama-cpp for efficient file downloads
- `simple-git`: Git operations for model repository access

**User control:**
- Network access only occurs when you explicitly download models or install the package
- No telemetry, analytics, or unauthorized network requests
- All downloads are from explicitly specified sources

### Shell Access

**Why it's needed:**
- **Native compilation fallback**: If prebuilt binaries aren't available for your platform, the package can compile llama.cpp from source
- **CMake build system**: `cmake-js` orchestrates the native build process
- **Platform detection**: Identifying your OS/architecture to select the correct binary

**Packages involved:**
- `cmake-js`: Build toolchain for native Node.js addons
- `cross-spawn`: Cross-platform process spawning for build scripts
- `chmodrp`: Sets executable permissions on native binaries

**User control:**
- Shell access only occurs during `npm install` or when explicitly building from source
- No runtime shell access when using the SDK in your application
- All build scripts are from the published npm package, auditable via the repository

### Eval Usage

The package may contain limited `eval()` usage in build tooling or native-binding loaders. This is common in packages that interface with compiled native code and does not pose a runtime security risk when the package is used as documented.

## Known Vulnerabilities (CVE)

Development dependencies (vitest, vite, esbuild) may show vulnerabilities in `npm audit`. These are **dev-only** tools used for testing and building the package itself—they are not included in the published package and do not affect users who install `boole-ai` in their projects.

To verify: check `package.json` — only `node-llama-cpp` is in `dependencies`, all others are `devDependencies`.

Users install `boole-ai` and only receive production dependencies in their `node_modules`.

## Reporting Security Issues

If you discover a security vulnerability in this package, please report it by:
1. **Do not** open a public GitHub issue
2. Email security concerns to: plowstjordan@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

We will respond within 48 hours and work with you on a fix and disclosure timeline.

## Security Best Practices for Users

When using this package:
- **Verify model sources**: Only download models from trusted repositories
- **Review model files**: GGUF files are binary model weights; inspect provenance before running
- **Isolate inference**: Run model inference in isolated processes or containers if handling untrusted input
- **Keep dependencies updated**: Regularly update to the latest version for security patches

## Privacy & Data Collection

This package does **not**:
- Send telemetry or usage data
- Phone home to any external servers (beyond explicit model downloads you initiate)
- Collect, store, or transmit user data
- Require API keys or authentication

Your models run entirely on your hardware. All inference happens locally.
